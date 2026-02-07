export declare class BotMessageDto {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export declare class BotChatDto {
    message: string;
    history?: BotMessageDto[];
}
