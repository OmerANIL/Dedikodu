import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateGossipDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  neighborhoodId: string;

  @ApiProperty({ example: 'Did you hear about...', maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  content: string;
}
