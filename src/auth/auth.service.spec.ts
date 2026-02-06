import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: Partial<UsersService>;
    let jwtService: Partial<JwtService>;

    const mockUser = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'test@tili.com',
        password: '$2b$10$hashedpassword',
        nom: 'Dupont',
        prenom: 'Jean',
        role: 'CONSULTANT',
        isActive: true,
        mustChangePassword: false,
        lockedUntil: null,
    };

    beforeEach(async () => {
        usersService = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            updateLastLogin: jest.fn(),
            incrementFailedAttempts: jest.fn(),
            updatePassword: jest.fn(),
            isAccountLocked: jest.fn().mockReturnValue(false),
        };

        jwtService = {
            sign: jest.fn().mockReturnValue('mock-token'),
            signAsync: jest.fn().mockResolvedValue('mock-token'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: usersService },
                { provide: JwtService, useValue: jwtService },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockImplementation((key: string) => {
                            if (key === 'JWT_EXPIRES_IN') return '15m';
                            if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe('login', () => {
        it('should return tokens for valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('ValidPass123!', 10);
            const user = { ...mockUser, password: hashedPassword };

            (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

            const result = await service.login({
                email: 'test@tili.com',
                password: 'ValidPass123!',
            });

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.user.email).toBe('test@tili.com');
        });

        it('should throw UnauthorizedException for invalid email', async () => {
            (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

            await expect(
                service.login({ email: 'invalid@tili.com', password: 'password' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for invalid password', async () => {
            (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
            (usersService.incrementFailedAttempts as jest.Mock).mockResolvedValue({ isLocked: false });

            await expect(
                service.login({ email: 'test@tili.com', password: 'wrongpassword' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw ForbiddenException for inactive account', async () => {
            const inactiveUser = { ...mockUser, isActive: false };
            (usersService.findByEmail as jest.Mock).mockResolvedValue(inactiveUser);

            await expect(
                service.login({ email: 'test@tili.com', password: 'password' }),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException for locked account', async () => {
            (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
            (usersService.isAccountLocked as jest.Mock).mockReturnValue(true);

            await expect(
                service.login({ email: 'test@tili.com', password: 'password' }),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const hashedPassword = await bcrypt.hash('OldPass123!', 10);
            const user = { ...mockUser, password: hashedPassword };

            (usersService.findById as jest.Mock).mockResolvedValue(user);
            (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
            (usersService.updatePassword as jest.Mock).mockResolvedValue(undefined);

            const result = await service.changePassword('507f1f77bcf86cd799439011', {
                currentPassword: 'OldPass123!',
                newPassword: 'NewPass456!',
            });

            expect(result.message).toBe('Mot de passe modifié avec succès');
        });

        it('should throw UnauthorizedException for wrong current password', async () => {
            const hashedPassword = await bcrypt.hash('OldPass123!', 10);
            const user = { ...mockUser, password: hashedPassword };

            (usersService.findById as jest.Mock).mockResolvedValue(user);
            (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

            await expect(
                service.changePassword('507f1f77bcf86cd799439011', {
                    currentPassword: 'WrongPass!',
                    newPassword: 'NewPass456!',
                }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw ForbiddenException when new password is same as old', async () => {
            const hashedPassword = await bcrypt.hash('SamePass123!', 10);
            const user = { ...mockUser, password: hashedPassword };

            (usersService.findById as jest.Mock).mockResolvedValue(user);
            (usersService.findByEmail as jest.Mock).mockResolvedValue(user);

            await expect(
                service.changePassword('507f1f77bcf86cd799439011', {
                    currentPassword: 'SamePass123!',
                    newPassword: 'SamePass123!',
                }),
            ).rejects.toThrow(ForbiddenException);
        });
    });
});
