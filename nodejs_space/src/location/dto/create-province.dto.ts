import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProvinceDto {
  @ApiProperty({ example: 'İstanbul' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
