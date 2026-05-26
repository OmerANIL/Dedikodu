import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateSubscriptionDto {
  @ApiProperty({ enum: ['basic', 'gold', 'platinum'] })
  @IsEnum(['basic', 'gold', 'platinum'])
  subscriptionLevel: 'basic' | 'gold' | 'platinum';
}
