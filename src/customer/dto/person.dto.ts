import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PersonDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly role: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  readonly ownershipShare: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

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
  @IsNotEmpty()
  readonly nationalId: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

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
  readonly emergency: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  readonly phoneNumbers: any[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  readonly assets: any[];
}
