import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    sendWelcomeEmail(to: string, name: string, temporaryPassword: string): Promise<void>;
    sendPasswordChangedEmail(to: string, name: string): Promise<void>;
    private getWelcomeEmailTemplate;
    private getPasswordChangedTemplate;
}
