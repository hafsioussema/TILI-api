import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
    @Prop({ required: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true })
    code: string;

    @Prop({ required: true, enum: ['PASSWORD_RESET'], default: 'PASSWORD_RESET' })
    type: string;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: false })
    isUsed: boolean;

    @Prop({ default: 0 })
    attempts: number;

    @Prop({ default: 3 })
    maxAttempts: number;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Index pour les recherches
OtpSchema.index({ email: 1, type: 1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
