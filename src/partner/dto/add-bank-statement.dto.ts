import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddBankStatementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string; // bank statement date

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly filename: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly filenameOriginal: string;
}
