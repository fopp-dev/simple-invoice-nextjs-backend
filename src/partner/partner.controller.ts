import { Body, Controller, Get, HttpStatus, Param, Post, Res, UseFilters, UseGuards } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MysqlExceptionFilter } from '../filters/mysql-exception.filter';
import { RolesGuard } from '../guard/roles.guard';
import { PartnerIsMeGuard } from '../guard/partner-is-me.guard';
import { Roles } from '../decorators/roles.decorator';
import { ROLES } from '../constant';
import { AuthUser } from '../decorators/user.decorator';
import { RegisterInvoiceDto } from './dto/register-invoice.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { AddBankStatementDto } from './dto/add-bank-statement.dto';
import PeriodDto from './dto/period.dto';
import { UpdateInstallmentCommentDto } from './dto/update-installment-comment.dto';

@Controller('api/partner')
export class PartnerController {
  constructor(
    private readonly partnerService: PartnerService,
  ) {
  }

  @ApiTags('partner')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load all partners',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('all')
  @Roles(ROLES.MTAJI_GLOBAL_CREDIT, ROLES.MTAJI_LOCAL_CREDIT, ROLES.MTAJI_LOCAL_ADMIN)
  @UseFilters(MysqlExceptionFilter)
  async getAllPartners(@AuthUser() user: any, @Res() res: any) {
    const response = await this.partnerService.getAllPartners();

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('partner')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load customers belong to partner',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard, PartnerIsMeGuard)
  @Get('customers/:partnerId')
  @Roles(ROLES.PARTNER, ROLES.MTAJI_GLOBAL_CREDIT, ROLES.MTAJI_LOCAL_CREDIT, ROLES.MTAJI_LOCAL_ADMIN)
  @UseFilters(MysqlExceptionFilter)
  async getPartnerCustomers(@Param('partnerId') partnerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.partnerService.getPartnerCustomers(partnerId);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('partner')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'partner registers sales invoice',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('register-invoice')
  @Roles(ROLES.PARTNER)
  @UseFilters(MysqlExceptionFilter)
  async registerInvoice(@Body() registerInvoiceDto: RegisterInvoiceDto, @Res() res: any, @AuthUser() user: any,) {
    const response = await this.partnerService.registerInvoice(registerInvoiceDto, user);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('partner')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'partner registers payment',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('register-payment/:customerId')
  @Roles(ROLES.PARTNER)
  @UseFilters(MysqlExceptionFilter)
  async registerPayment(@Body() registerPaymentDto: RegisterPaymentDto, @Param('customerId') customerId: number, @Res() res: any, @AuthUser() user: any) {
    const response = await this.partnerService.registerPayment(registerPaymentDto, customerId, user);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('partner')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'partner adds bank statement',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('add-bank-statement')
  @Roles(ROLES.PARTNER)
  @UseFilters(MysqlExceptionFilter)
  async addBankStatement(@Body() addBankStatementDto: AddBankStatementDto, @AuthUser() user: any, @Res() res: any) {
    const response = await this.partnerService.addBankStatement(addBankStatementDto, user.id);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('partner')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load future installments on specific customer for a partner \n' +
      ' if customer -1, it means all customers',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('future-installments/:partnerId/:customerId')
  @UseFilters(MysqlExceptionFilter)
  async getFutureInstallments(@Param('partnerId') partnerId: number, @Param('customerId') customerId: number, @Body() periodDto: PeriodDto, @Res() res: any) {
    const response = await this.partnerService.getFutureInstallments(partnerId, customerId, periodDto);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('partner')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load past installments on specific customer for a partner \n' +
      ' if customer -1, it means all customers',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('past-installments/:partnerId/:customerId')
  @UseFilters(MysqlExceptionFilter)
  async getPastInstallments(@Param('partnerId') partnerId: number, @Param('customerId') customerId: number, @Body() periodDto: PeriodDto, @AuthUser() user: any, @Res() res: any) {
    const response = await this.partnerService.getPastInstallments(partnerId, customerId, periodDto);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('partner')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load invoices on specific customer for a partner \n' +
      ' if customer -1, it means all customers',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('invoices/:partnerId/:customerId')
  @UseFilters(MysqlExceptionFilter)
  async getInvoices(@Param('partnerId') partnerId: number, @Param('customerId') customerId: number, @Body() periodDto: PeriodDto, @AuthUser() user: any, @Res() res: any) {
    const response = await this.partnerService.getInvoices(partnerId, customerId, periodDto);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('partner')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'get partner credit information (such as used amount and total amount)',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard, PartnerIsMeGuard)
  @Get('credit-information/:partnerId')
  @Roles(ROLES.PARTNER, ROLES.MTAJI_GLOBAL_CREDIT, ROLES.MTAJI_LOCAL_CREDIT, ROLES.MTAJI_LOCAL_ADMIN)
  @UseFilters(MysqlExceptionFilter)
  async getPartnerCredit(@Param('partnerId') partnerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.partnerService.getPartnerCredit(partnerId);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('partner')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'edit installment comment',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('installment/update-comment/:installmentId')
  @UseFilters(MysqlExceptionFilter)
  async updateInstallmentComment(@Param('installmentId') installmentId: number, @Body() updateInstallmentCommentDto: UpdateInstallmentCommentDto, @AuthUser() user: any, @Res() res: any) {
    const response = await this.partnerService.updateInstallmentComment(installmentId, updateInstallmentCommentDto);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }
}
