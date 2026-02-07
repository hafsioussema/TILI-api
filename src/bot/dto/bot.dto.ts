import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class BotMessageDto {
  @ApiProperty({ enum: ['user', 'assistant', 'system'] })
  @IsIn(['user', 'assistant', 'system'])
  role: 'user' | 'assistant' | 'system';

  @ApiProperty()
  @IsString()
  content: string;
}

export class BotChatDto {
  @ApiProperty({ description: 'Message de l\'utilisateur' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Historique récent de la conversation', type: [BotMessageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BotMessageDto)
  history?: BotMessageDto[];
}
