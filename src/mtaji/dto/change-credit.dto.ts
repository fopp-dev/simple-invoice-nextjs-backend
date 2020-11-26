import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ChangeCreditDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly credit: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly comment: string;
}
