import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateInstallmentCommentDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly comment: string;

}
