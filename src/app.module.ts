
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { DocumentsModule } from './documents/documents.module';
import { ProjectsModule } from './projects/projects.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TasksModule } from './tasks/tasks.module';
import { BotModule } from './bot/bot.module';
import { UsersService } from './users/users.service';
import { MeetingsModule } from './meetings/meetings.module';
import { NotificationsModule } from './notifications/notifications.module';


@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Schedule Module for Cron Jobs
    ScheduleModule.forRoot(),

    // Static Files (for Uploads)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    UsersModule,
    AuthModule,
    EmailModule,
    DocumentsModule,
    ProjectsModule,
    DashboardModule,
    TasksModule,
    BotModule,
    MeetingsModule,
    NotificationsModule,
  ],
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) { }

  async onModuleInit() {
    // Seed admin par défaut au démarrage
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@tili.com');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD', 'Admin123!');
    await this.usersService.seedAdmin(adminEmail, adminPassword);
  }
}
