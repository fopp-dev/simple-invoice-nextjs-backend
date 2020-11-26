import { Module } from '@nestjs/common';
import { PartnerController } from './partner.controller';
import { PartnerService } from './partner.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from '../user/entities/partner.entity';
import { User } from '../user/entities/user.entity';
import { Customer } from '../user/entities/customer.entity';
import { CustomerDocument } from '../customer/entities/customer-document.entity';
import { MailService } from '../services/mail/mail.service';
import { LogApplication } from '../common/entities/log-application.entity';
import { Invoice } from '../common/entities/invoice.entity';
import { InvoiceInstallment } from '../common/entities/invoice-installment.entity';
import { Payment } from '../common/entities/payment.entity';
import { PaymentInstallment } from '../common/entities/payment-installment.entity';
import { PartnerDocument } from './entities/partner-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Partner,
      User,
      Customer,
      CustomerDocument,
      LogApplication,
      Invoice,
      InvoiceInstallment,
      Payment,
      PaymentInstallment,
      PartnerDocument,
    ]),
  ],
  controllers: [PartnerController],
  providers: [PartnerService, MailService]
})
export class PartnerModule {}
