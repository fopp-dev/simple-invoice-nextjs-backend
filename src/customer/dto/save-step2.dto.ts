import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class SaveStep2Dto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly requestedCredit: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly lastSales: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly currentSales: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly lastCostGoods: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly currentCostGoods: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly lastCostStaff: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly currentCostStaff: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly lastCostOther: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly currentCostOther: number;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  readonly assets: any[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  readonly loans: any[];

}
