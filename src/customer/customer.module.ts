import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../user/entities/customer.entity';
import { User } from '../user/entities/user.entity';
import { CustomerAsset } from './entities/customer-asset.entity';
import { CustomerLoan } from './entities/customer-loan.entity';
import { CustomerPerson } from './entities/customer-person.entity';
import { MailService } from '../services/mail/mail.service';
import { LogApplication } from '../common/entities/log-application.entity';
import { CustomerDocument } from './entities/customer-document.entity';
import { Invoice } from '../common/entities/invoice.entity';
import { InvoiceInstallment } from '../common/entities/invoice-installment.entity';
import { PaymentInstallment } from '../common/entities/payment-installment.entity';
import { LogCreditLimit } from '../common/entities/log-creditlimit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      User,
      CustomerAsset,
      CustomerLoan,
      CustomerPerson,
      LogApplication,
      CustomerDocument,
      Invoice,
      InvoiceInstallment,
      PaymentInstallment,
      LogCreditLimit,
    ]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, MailService]
})
export class CustomerModule {}
