import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';

describe('UsersService', () => {
    let service: UsersService;
    let mockUserModel: any;

    const mockUser = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean@tili.com',
        role: Role.CONSULTANT,
        isActive: true,
        save: jest.fn().mockReturnThis(),
    };

    beforeEach(async () => {
        mockUserModel = {
            findOne: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            constructor: jest.fn().mockImplementation(() => mockUser),
        };

        // Mock constructor
        function MockUserModel(data: any) {
            return { ...mockUser, ...data, save: jest.fn().mockResolvedValue({ ...mockUser, ...data }) };
        }
        MockUserModel.findOne = mockUserModel.findOne;
        MockUserModel.find = mockUserModel.find;
        MockUserModel.findById = mockUserModel.findById;
        MockUserModel.findByIdAndUpdate = mockUserModel.findByIdAndUpdate;
        MockUserModel.findByIdAndDelete = mockUserModel.findByIdAndDelete;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getModelToken(User.name), useValue: MockUserModel },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    describe('create', () => {
        it('should create a user and return temporary password', async () => {
            // The service calls findOne().exec() but also uses the result directly
            // Need to mock it to return null (no existing user)
            mockUserModel.findOne.mockResolvedValue(null);

            const result = await service.create({
                nom: 'Dupont',
                prenom: 'Jean',
                email: 'newuser@tili.com',
                role: Role.CONSULTANT,
            });

            expect(result.user).toBeDefined();
            expect(result.temporaryPassword).toBeDefined();
            expect(result.temporaryPassword.length).toBeGreaterThanOrEqual(12);
        });

        it('should throw ConflictException for duplicate email', async () => {
            mockUserModel.findOne.mockResolvedValue(mockUser);

            await expect(
                service.create({
                    nom: 'Dupont',
                    prenom: 'Jean',
                    email: 'jean@tili.com',
                    role: Role.CONSULTANT,
                }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            mockUserModel.find.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue([mockUser]),
                }),
            });

            const result = await service.findAll();
            expect(result).toHaveLength(1);
        });
    });

    describe('findById', () => {
        it('should return a user', async () => {
            mockUserModel.findById.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockUser),
                }),
            });

            const result = await service.findById('507f1f77bcf86cd799439011');
            expect(result.email).toBe('jean@tili.com');
        });

        it('should throw NotFoundException for non-existent user', async () => {
            mockUserModel.findById.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(null),
                }),
            });

            await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('generateTemporaryPassword', () => {
        it('should generate a password of specified length', () => {
            const password = service.generateTemporaryPassword(16);
            expect(password.length).toBe(16);
        });

        it('should generate different passwords each time', () => {
            const password1 = service.generateTemporaryPassword();
            const password2 = service.generateTemporaryPassword();
            expect(password1).not.toBe(password2);
        });
    });

    describe('toggleStatus', () => {
        it('should toggle user status', async () => {
            const user = { ...mockUser, isActive: true, save: jest.fn().mockResolvedValue({ ...mockUser, isActive: false }) };
            mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

            const result = await service.toggleStatus('507f1f77bcf86cd799439011');
            expect(user.save).toHaveBeenCalled();
        });
    });
});
