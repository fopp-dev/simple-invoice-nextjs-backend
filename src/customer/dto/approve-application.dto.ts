import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

class Document {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly filenameOriginal: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly filename: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly applicationStep: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly customer: number;
}

export class ApproveApplicationDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  readonly documents: Document[];

  @ApiProperty()
  @IsString()
  readonly partnerComments: string;

}
