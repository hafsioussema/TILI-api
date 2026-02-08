
import { Controller, Get, Post, Delete, Body, Param, UseInterceptors, UploadedFile, HttpException, HttpStatus, UseGuards, ForbiddenException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MeetingsService } from './meetings.service';
import { MeetingsSchedulerService } from './meetings-scheduler.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/schemas/user.schema';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
    constructor(
        private readonly meetingsService: MeetingsService,
        private readonly schedulerService: MeetingsSchedulerService,
    ) { }

    @Post()
    async createMetadata(@Body() body: { title: string; date?: string; participants?: string[]; minPresenceDuration?: number }, @CurrentUser() user: any) {
        // Ensure the creator is the first participant (Organizer)
        let participants = body.participants || [];
        if (user.email) {
            // Remove if already exists to ensure it's at index 0
            participants = participants.filter(p => p !== user.email);
            participants.unshift(user.email);
        }

        const meeting = await this.meetingsService.createMetadata({
            title: body.title || 'Untitled Meeting',
            date: body.date ? new Date(body.date) : new Date(),
            participants: participants,
            minPresenceDuration: body.minPresenceDuration,
        });

        // Si la réunion est planifiée dans le futur, envoyer les invitations
        const meetingDate = new Date(meeting.date);
        const now = new Date();
        if (meetingDate > now) {
            await this.schedulerService.sendMeetingInvitation(meeting, user.email);
        }

        return meeting;
    }

    @Post(':id/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(mp3|wav|m4a|mp4|webm)$/)) {
                return callback(new HttpException('Only audio/video files are allowed!', HttpStatus.BAD_REQUEST), false);
            }
            callback(null, true);
        },
    }))
    uploadAudio(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body('isLive') isLive: string) {
        if (!file) throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
        const isLiveBool = isLive === 'true';
        return this.meetingsService.uploadAudio(id, file, isLiveBool);
    }

    // Legacy or shortcut
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    createLegacy(@UploadedFile() file: Express.Multer.File) {
        return this.meetingsService.create(file);
    }

    @Get()
    findAll(@CurrentUser() user: any) {
        // Filter meetings where user is participant
        return this.meetingsService.findAllByUser(user.email);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CurrentUser() user: any) {
        const meeting = await this.meetingsService.findOne(id);
        if (!meeting) throw new HttpException('Meeting not found', HttpStatus.NOT_FOUND);

        // Security Check: Is user in participants?
        const participants = JSON.parse(meeting.participants || '[]');
        if (!participants.includes(user.email)) {
            throw new ForbiddenException('You do not have permission to access this meeting.');
        }

        return meeting;
    }

    @Post(':id') // Using Post for update to avoid potential Patch issues in some environments, or just follow REST
    async update(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
        const meeting = await this.meetingsService.findOne(id);
        if (!meeting) throw new HttpException('Meeting not found', HttpStatus.NOT_FOUND);

        // Security Check: Is user the organizer? (first participant)
        const participants = JSON.parse(meeting.participants || '[]');
        if (participants.length === 0 || participants[0] !== user.email) {
            throw new ForbiddenException('Only the organizer can edit this meeting.');
        }

        return this.meetingsService.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.meetingsService.remove(id);
    }

    @Get(':id/file')
    async getFile(@Param('id') id: string, @Res() res: any) {
        const meeting = await this.meetingsService.findOne(id);
        if (!meeting || !meeting.audioUrl) {
            throw new HttpException('File not found', HttpStatus.NOT_FOUND);
        }
        return res.sendFile(meeting.audioUrl, { root: './' });
    }

    // ============== Document Association ==============

    @Post(':id/documents')
    async addDocument(
        @Param('id') id: string,
        @Body() body: { documentId: string },
        @CurrentUser() user: any,
    ) {
        const meeting = await this.meetingsService.findOne(id);
        if (!meeting) throw new HttpException('Meeting not found', HttpStatus.NOT_FOUND);

        // Security Check: Is user a participant?
        const participants = JSON.parse(meeting.participants || '[]');
        if (!participants.includes(user.email)) {
            throw new ForbiddenException('You do not have permission to modify this meeting.');
        }

        return this.meetingsService.addDocument(id, body.documentId);
    }

    @Delete(':id/documents/:documentId')
    async removeDocument(
        @Param('id') id: string,
        @Param('documentId') documentId: string,
        @CurrentUser() user: any,
    ) {
        const meeting = await this.meetingsService.findOne(id);
        if (!meeting) throw new HttpException('Meeting not found', HttpStatus.NOT_FOUND);

        // Security Check: Is user a participant?
        const participants = JSON.parse(meeting.participants || '[]');
        if (!participants.includes(user.email)) {
            throw new ForbiddenException('You do not have permission to modify this meeting.');
        }

        return this.meetingsService.removeDocument(id, documentId);
    }

    @Get(':id/documents')
    async getDocuments(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        const meeting = await this.meetingsService.findOne(id);
        if (!meeting) throw new HttpException('Meeting not found', HttpStatus.NOT_FOUND);

        // Security Check: Is user a participant?
        const participants = JSON.parse(meeting.participants || '[]');
        if (!participants.includes(user.email)) {
            throw new ForbiddenException('You do not have permission to access this meeting.');
        }

        return this.meetingsService.getDocuments(id);
    }

    @Post(':id/finalize')
    async finalizeWithoutAudio(
        @Param('id') id: string,
        @CurrentUser() user: any,
    ) {
        const meeting = await this.meetingsService.findOne(id);
        if (!meeting) throw new HttpException('Meeting not found', HttpStatus.NOT_FOUND);

        // Security Check: Is user the organizer? (first participant)
        const participants = JSON.parse(meeting.participants || '[]');
        if (participants.length === 0 || participants[0] !== user.email) {
            throw new ForbiddenException('Only the organizer can finalize this meeting.');
        }

        return this.meetingsService.finalizeWithoutAudio(id);
    }
}
