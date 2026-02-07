import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { OtpService } from './otp.service';
import { EmailModule } from '../email/email.module';
import { Otp, OtpSchema } from './schemas/otp.schema';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'default-secret',
                signOptions: {
                    expiresIn: '15m',
                },
            }),
            inject: [ConfigService],
        }),
        EmailModule,
        MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, OtpService],
    exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule { }
