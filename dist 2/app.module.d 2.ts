import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
export declare class AppModule implements OnModuleInit {
    private configService;
    private usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    onModuleInit(): Promise<void>;
}
