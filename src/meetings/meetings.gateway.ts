
import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface ChatMessage {
    sender: string;
    senderName: string;
    text: string;
    timestamp: string;
    meetingId: string;
}

interface Participant {
    id: string;
    name: string;
    email: string;
    socketId: string;
    isVideoOff?: boolean;
    isMuted?: boolean;
    isScreenSharing?: boolean;
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class MeetingsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(MeetingsGateway.name);

    // meetingId -> Map<socketId, Participant>
    private activeParticipants = new Map<string, Map<string, Participant>>();

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // Remove participant from all rooms
        this.activeParticipants.forEach((participants, meetingId) => {
            const participant = participants.get(client.id);
            if (participant) {
                participants.delete(client.id);
                this.logger.log(`Participant ${participant.name} left meeting ${meetingId}`);

                // Broadcast updated participant list
                this.server.to(meetingId).emit('participantsUpdated', Array.from(participants.values()));

                // Broadcast leave message
                this.server.to(meetingId).emit('messageReceived', {
                    sender: 'system',
                    senderName: 'System',
                    text: `${participant.name} a quitté la réunion.`,
                    timestamp: new Date().toISOString(),
                    meetingId,
                });
            }
        });
    }

    @SubscribeMessage('joinMeeting')
    handleJoinMeeting(
        @MessageBody() data: { meetingId: string; user: { name: string; email: string } },
        @ConnectedSocket() client: Socket,
    ) {
        const { meetingId, user } = data;
        client.join(meetingId);

        if (!this.activeParticipants.has(meetingId)) {
            this.activeParticipants.set(meetingId, new Map());
        }

        const participants = this.activeParticipants.get(meetingId);
        if (!participants) return { status: 'error' };

        const participant: Participant = {
            id: user.email, // Using email as unique ID
            name: user.name,
            email: user.email,
            socketId: client.id,
        };

        participants.set(client.id, participant);

        this.logger.log(`Participant ${user.name} joined meeting ${meetingId}`);

        // Broadcast updated participant list
        this.server.to(meetingId).emit('participantsUpdated', Array.from(participants.values()));

        // Broadcast join message
        this.server.to(meetingId).emit('messageReceived', {
            sender: 'system',
            senderName: 'System',
            text: `${user.name} a rejoint la réunion.`,
            timestamp: new Date().toISOString(),
            meetingId,
        });

        return { status: 'ok' };
    }

    @SubscribeMessage('leaveMeeting')
    handleLeaveMeeting(
        @MessageBody() data: { meetingId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { meetingId } = data;
        client.leave(meetingId);

        const participants = this.activeParticipants.get(meetingId);
        if (participants) {
            const participant = participants.get(client.id);
            if (participant) {
                participants.delete(client.id);

                this.server.to(meetingId).emit('participantsUpdated', Array.from(participants.values()));

                // Broadcast leave message
                this.server.to(meetingId).emit('messageReceived', {
                    sender: 'system',
                    senderName: 'System',
                    text: `${participant.name} a quitté la réunion.`,
                    timestamp: new Date().toISOString(),
                    meetingId,
                });
            }
        }
    }

    @SubscribeMessage('sendMessage')
    handleSendMessage(@MessageBody() data: ChatMessage) {
        this.logger.log(`Message from ${data.senderName} in ${data.meetingId}: ${data.text}`);
        this.server.to(data.meetingId).emit('messageReceived', data);
    }

    @SubscribeMessage('callUser')
    handleCallUser(
        @MessageBody() data: { offer: any; to: string; from: string; name: string },
        @ConnectedSocket() client: Socket,
    ) {
        this.server.to(data.to).emit('callMade', {
            offer: data.offer,
            socket: client.id,
            from: data.from,
            name: data.name
        });
    }

    @SubscribeMessage('makeAnswer')
    handleMakeAnswer(
        @MessageBody() data: { answer: any; to: string },
        @ConnectedSocket() client: Socket,
    ) {
        this.server.to(data.to).emit('answerMade', {
            socket: client.id,
            answer: data.answer,
        });
    }

    @SubscribeMessage('iceCandidate')
    handleIceCandidate(
        @MessageBody() data: { candidate: any; to: string },
        @ConnectedSocket() client: Socket,
    ) {
        this.server.to(data.to).emit('iceCandidateReceived', {
            socket: client.id,
            candidate: data.candidate,
        });
    }

    @SubscribeMessage('toggleMedia')
    handleToggleMedia(
        @MessageBody() data: { meetingId: string; video?: boolean; audio?: boolean; screen?: boolean },
        @ConnectedSocket() client: Socket,
    ) {
        const participants = this.activeParticipants.get(data.meetingId);
        if (participants) {
            const participant = participants.get(client.id);
            if (participant) {
                if (data.video !== undefined) participant.isVideoOff = data.video;
                if (data.audio !== undefined) participant.isMuted = data.audio;
                if (data.screen !== undefined) participant.isScreenSharing = data.screen;
                this.server.to(data.meetingId).emit('participantsUpdated', Array.from(participants.values()));
            }
        }
    }
}
