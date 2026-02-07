import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { EmailService } from '../email/email.service';
export declare class UsersController {
    private readonly usersService;
    private readonly emailService;
    constructor(usersService: UsersService, emailService: EmailService);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findAll(): Promise<UserResponseDto[]>;
    findOne(id: string): Promise<UserResponseDto>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    remove(id: string): Promise<void>;
    toggleStatus(id: string): Promise<UserResponseDto>;
    private mapToResponse;
}
