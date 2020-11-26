import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class SubmitDocumentsDto {
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  readonly documents: any[];

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  readonly persons: any[];

}
