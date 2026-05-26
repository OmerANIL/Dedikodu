import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateNeighborhoodDto {
  @ApiProperty()
  @IsUUID()
  districtId: string;

  @ApiProperty({ example: 'Caferağa' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
