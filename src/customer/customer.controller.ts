import { Body, Controller, Get, HttpStatus, Param, Post, Res, UseFilters, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MysqlExceptionFilter } from '../filters/mysql-exception.filter';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ROLES } from '../constant';
import { SaveStep1Dto } from './dto/save-step1.dto';
import { AuthUser } from '../decorators/user.decorator';
import { SaveStep2Dto } from './dto/save-step2.dto';
import { PersonDto } from './dto/person.dto';
import { SaveStep4Dto } from './dto/save-step4.dto';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { ApproveApplicationDto } from './dto/approve-application.dto';
import { SubmitDocumentsDto } from './dto/submit-documents.dto';
import { CustomerIsMeGuard } from '../guard/customer-is-me.guard';

@Controller('api/customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
  ) {
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'partner registers a customer',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('application-create')
  @Roles(ROLES.PARTNER)
  @UseFilters(MysqlExceptionFilter)
  async registerCustomer(@Body() registerCustomerDto: RegisterCustomerDto, @Res() res: any, @AuthUser() user: any) {
    const response = await this.customerService.registerCustomer(registerCustomerDto, user.id);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load all customers',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('all')
  @Roles(ROLES.MTAJI_GLOBAL_CREDIT, ROLES.MTAJI_LOCAL_CREDIT, ROLES.MTAJI_LOCAL_ADMIN, ROLES.PARTNER)
  @UseFilters(MysqlExceptionFilter)
  async getAllCustomers(@Res() res: any) {
    const response = await this.customerService.getAllCustomers();

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'customer saves step one data for customer registration',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard, CustomerIsMeGuard)
  @Post('application-customer-save-step1/:customerId')
  @Roles(ROLES.CUSTOMER)
  @UseFilters(MysqlExceptionFilter)
  async saveStep1(@Body() saveStep1Dto: SaveStep1Dto, @Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.saveStep1(saveStep1Dto, customerId);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'customer saves step two data for customer registration',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard, CustomerIsMeGuard)
  @Post('application-customer-save-step2/:customerId')
  @Roles(ROLES.CUSTOMER)
  @UseFilters(MysqlExceptionFilter)
  async saveStep2(@Body() saveStep2Dto: SaveStep2Dto, @Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.saveStep2(saveStep2Dto, customerId);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'customer saves step three data for customer registration',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard, CustomerIsMeGuard)
  @Post('application-customer-save-step3/:customerId')
  @Roles(ROLES.CUSTOMER)
  @UseFilters(MysqlExceptionFilter)
  async saveStep3(@Body() saveStep3Dto: PersonDto[], @Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.saveStep3(saveStep3Dto, customerId);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'customer saves step four data(documents) for customer registration',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard, CustomerIsMeGuard)
  @Post('application-customer-save-step4/:customerId')
  @Roles(ROLES.CUSTOMER, ROLES.MTAJI_GLOBAL_CREDIT, ROLES.MTAJI_LOCAL_CREDIT, ROLES.MTAJI_LOCAL_ADMIN)
  @UseFilters(MysqlExceptionFilter)
  async saveStep4(@Body() saveStep4Dto: SaveStep4Dto, @Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.saveStep4(saveStep4Dto, customerId, user);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'customer submit the application',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard, CustomerIsMeGuard)
  @Post('application-customer-submit/:customerId')
  @Roles(ROLES.CUSTOMER)
  @UseFilters(MysqlExceptionFilter)
  async submitApplication(@AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.submitApplication(user.id);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }


  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'approve application and sign off',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('application-partner-approve/:customerId')
  @Roles(ROLES.PARTNER, ROLES.MTAJI_GLOBAL_CREDIT, ROLES.MTAJI_LOCAL_CREDIT, ROLES.MTAJI_LOCAL_ADMIN)
  @UseFilters(MysqlExceptionFilter)
  async approveApplication(@Body() approveApplicationDto: ApproveApplicationDto, @Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.approveApplication(approveApplicationDto, customerId, user);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'submit final signed documents',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('application-partner-submit-docs/:customerId')
  @Roles(ROLES.PARTNER, ROLES.MTAJI_GLOBAL_CREDIT, ROLES.MTAJI_LOCAL_CREDIT, ROLES.MTAJI_LOCAL_ADMIN)
  @UseFilters(MysqlExceptionFilter)
  async submitDocuments(@Body() submitDocumentsDto: SubmitDocumentsDto, @Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.submitDocuments(submitDocumentsDto, customerId, user);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'mtaji activates the customer',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('application-mtaji-activate-customer/:customerId')
  @Roles(ROLES.MTAJI_GLOBAL_CREDIT, ROLES.MTAJI_LOCAL_CREDIT, ROLES.MTAJI_LOCAL_ADMIN)
  @UseFilters(MysqlExceptionFilter)
  async activateCustomer(@Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.activateCustomer(customerId, user.id);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load customer main data by customer id',
  })
  @UseGuards(AuthGuard('jwt'), CustomerIsMeGuard)
  @Get('main/:customerId')
  @UseFilters(MysqlExceptionFilter)
  async getCustomerMain(@Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.getCustomerMain(customerId, user);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load customer persons by customer id',
  })
  @UseGuards(AuthGuard('jwt'), CustomerIsMeGuard)
  @Get('persons/:customerId')
  @UseFilters(MysqlExceptionFilter)
  async getCustomerPersons(@Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.getCustomerPersons(customerId, user);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load customer documents by customer id',
  })
  @UseGuards(AuthGuard('jwt'), CustomerIsMeGuard)
  @Get('documents/:customerId')
  @UseFilters(MysqlExceptionFilter)
  async getCustomerDocuments(@Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.getCustomerDocuments(customerId, user);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load invoice installments not fully paid on a customer',
  })
  @UseGuards(AuthGuard('jwt'), CustomerIsMeGuard)
  @Get('installments-not-fully-paid/:customerId')
  @UseFilters(MysqlExceptionFilter)
  async getInstallmentsNotFullyPaid(@Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.getInstallmentsNotFullyPaid(customerId, user);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'load customer credit change logs',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('credit-change-log/:customerId')
  @Roles(ROLES.MTAJI_GLOBAL_CREDIT, ROLES.MTAJI_LOCAL_CREDIT, ROLES.MTAJI_LOCAL_ADMIN, ROLES.PARTNER)
  @UseFilters(MysqlExceptionFilter)
  async getCreditChangeLog(@Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.getCreditChangeLog(customerId, user);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'get customer credit information',
  })
  @UseGuards(AuthGuard('jwt'), CustomerIsMeGuard)
  @Get('credit-information/:customerId')
  @UseFilters(MysqlExceptionFilter)
  async getCustomerCredit(@Param('customerId') customerId: number, @AuthUser() user: any, @Res() res: any) {
    const response = await this.customerService.getCustomerCredit(customerId, user);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('customer')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'get nearest installment of customer',
  })
  @UseGuards(AuthGuard('jwt'), CustomerIsMeGuard)
  @Get('next-payment/:customerId')
  @Roles(ROLES.CUSTOMER)
  @UseFilters(MysqlExceptionFilter)
  async getNextPayment(@Param('customerId') customerId: number, @Res() res: any) {
    const response = await this.customerService.getNextPayment(customerId);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }
}
