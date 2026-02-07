import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { EmailModule } from '../src/email/email.module';
import { UsersService } from '../src/users/users.service';
import { Role } from '../src/common/enums/role.enum';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let usersService: UsersService;
  let adminToken: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'test-secret',
              JWT_EXPIRES_IN: '15m',
              JWT_REFRESH_EXPIRES_IN: '7d',
              SMTP_HOST: 'localhost',
              SMTP_PORT: 1025,
              SMTP_USER: 'test',
              SMTP_PASS: 'test',
            }),
          ],
        }),
        MongooseModule.forRoot(uri),
        AuthModule,
        UsersModule,
        EmailModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    usersService = moduleFixture.get<UsersService>(UsersService);

    // Create admin user for tests
    await usersService.seedAdmin('admin@test.com', 'Admin123!');
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'Admin123!' })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('admin@test.com');
      expect(response.body.user.role).toBe(Role.ADMIN);

      adminToken = response.body.accessToken;
    });

    it('should reject invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@test.com', password: 'Admin123!' })
        .expect(401);
    });

    it('should reject invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'WrongPassword!' })
        .expect(401);
    });

    it('should reject empty email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: '', password: 'Admin123!' })
        .expect(400);
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should return profile for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.email).toBe('admin@test.com');
      expect(response.body.role).toBe(Role.ADMIN);
    });

    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should return new access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });
  });

  describe('Role-based access', () => {
    let consultantToken: string;

    beforeAll(async () => {
      // Create a consultant user
      const { temporaryPassword } = await usersService.create({
        nom: 'Consultant',
        prenom: 'Test',
        email: 'consultant@test.com',
        role: Role.CONSULTANT,
      });

      // Change the must change password flag for testing
      const user = await usersService.findByEmail('consultant@test.com');
      await usersService.updatePassword(
        user!._id.toString(),
        'Consultant123!',
      );

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'consultant@test.com', password: 'Consultant123!' });

      consultantToken = loginResponse.body.accessToken;
    });

    it('should allow admin to access /users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny consultant access to /users', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${consultantToken}`)
        .expect(403);
    });
  });
});
