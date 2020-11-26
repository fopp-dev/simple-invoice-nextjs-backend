import { Body, Controller, HttpStatus, Param, Post, Res, UseFilters, UseGuards } from '@nestjs/common';
import { MtajiService } from './mtaji.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ROLES } from '../constant';
import { MysqlExceptionFilter } from '../filters/mysql-exception.filter';
import { AuthUser } from '../decorators/user.decorator';
import { ChangeCreditDto } from './dto/change-credit.dto';

@Controller('api/mtaji')
export class MtajiController {
  constructor(
    private readonly mtajiService: MtajiService,
  ) {
  }

  @ApiTags('mtaji')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'mtaji close the credit of customer',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('close-credit/:customerId')
  @Roles(ROLES.MTAJI_GLOBAL_CREDIT, ROLES.MTAJI_LOCAL_CREDIT)
  @UseFilters(MysqlExceptionFilter)
  async closeCredit(@Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.mtajiService.closeCredit(customerId, user.id);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('mtaji')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'mtaji changes the credit of customer',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('change-credit/:customerId')
  @Roles(ROLES.MTAJI_GLOBAL_CREDIT)
  @UseFilters(MysqlExceptionFilter)
  async changeCredit(@Param('customerId') customerId: number, @Body() changeCreditDto: ChangeCreditDto, @AuthUser() user: any, @Res() res: any) {
    const response = await this.mtajiService.changeCredit(changeCreditDto, customerId, user.id);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }
}
