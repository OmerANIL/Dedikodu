import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateDistrictDto {
  @ApiProperty()
  @IsUUID()
  provinceId: string;

  @ApiProperty({ example: 'Kadıköy' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
