import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class PaymentInstallmentDto {

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly invoiceInstallment: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;
}

export class RegisterPaymentDto {

  @ApiProperty()
  @IsString()
  @IsISO8601()
  @IsNotEmpty()
  readonly date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly account: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  readonly paymentInstallments: PaymentInstallmentDto[];

}
