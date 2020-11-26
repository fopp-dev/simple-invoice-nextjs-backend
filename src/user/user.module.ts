import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Partner } from './entities/partner.entity';
import { Customer } from './entities/customer.entity';
import { MailService } from '../services/mail/mail.service';
import { LogApplication } from '../common/entities/log-application.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Partner, Customer, LogApplication])
  ],
  controllers: [UserController],
  providers: [UserService, MailService]
})
export class UserModule {}
