import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class InstallmentDto {

  @ApiProperty()
  @IsString()
  @IsISO8601()
  @IsNotEmpty()
  readonly date: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly comment: string;

}

export class RegisterInvoiceDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly customer: string;

  @ApiProperty()
  @IsString()
  @IsISO8601()
  @IsNotEmpty()
  readonly date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly invoiceNumber: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  readonly installments: InstallmentDto[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly filenameInvoice: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly filenameInvoiceOriginal: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly filenameExcel: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly filenameExcelOriginal: string;

}
