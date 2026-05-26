import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'kullanici1', minLength: 3 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nickname: string;

  @ApiProperty({ example: 'Ali Veli' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'ali@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '+905551234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
