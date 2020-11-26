import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class SaveStep1Dto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly registeredName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly registrationNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly tinNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly vatNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly cityArea: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly street: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly blockNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly plotNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly companyPhone: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsOptional()
  readonly companyEmail: string;

  @ApiProperty()
  @IsString()
  @IsUrl()
  @IsOptional()
  readonly homepage: boolean;

}
