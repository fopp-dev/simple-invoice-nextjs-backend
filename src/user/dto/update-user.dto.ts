import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  readonly enabled: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

}
