import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsString } from 'class-validator';

class PeriodDto {

  @ApiProperty()
  @IsString()
  @IsISO8601()
  @IsNotEmpty()
  readonly startDate: string;

  @ApiProperty()
  @IsString()
  @IsISO8601()
  @IsNotEmpty()
  readonly endDate: string;

}

export default PeriodDto;
