import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class CreateReactionDto {
  @ApiProperty({ enum: ['approve', 'disapprove'] })
  @IsEnum(['approve', 'disapprove'])
  reactionType: 'approve' | 'disapprove';
}
