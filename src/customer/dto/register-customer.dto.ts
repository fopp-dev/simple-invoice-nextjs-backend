import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RegisterCustomerDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly tradingName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly customerNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly contactEmail: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly startYear: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly startMonth: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly annualSales: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly last3Months: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly suggestedCredit: number;

}
