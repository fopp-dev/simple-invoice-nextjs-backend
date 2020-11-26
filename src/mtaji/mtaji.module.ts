import { Module } from '@nestjs/common';
import { MtajiController } from './mtaji.controller';
import { MtajiService } from './mtaji.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogApplication } from '../common/entities/log-application.entity';
import { User } from '../user/entities/user.entity';
import { MailService } from '../services/mail/mail.service';
import { Customer } from '../user/entities/customer.entity';
import { LogCreditLimit } from '../common/entities/log-creditlimit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LogApplication, Customer, LogCreditLimit]),
  ],
  controllers: [MtajiController],
  providers: [MtajiService, MailService]
})
export class MtajiModule {}
