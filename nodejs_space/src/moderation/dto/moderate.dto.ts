import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class ModerateDto {
  @ApiProperty({ enum: ['approve', 'reject'] })
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';
}
