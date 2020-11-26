import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogApplication } from '../common/entities/log-application.entity';
import { User } from '../user/entities/user.entity';
import { MailService } from '../services/mail/mail.service';
import { ChangeCreditDto } from './dto/change-credit.dto';
import { Customer } from '../user/entities/customer.entity';
import { closeCreditComment, CREDIT_CHANGE_TYPE, ERR_MESSAGES } from '../constant';
import { LogCreditLimit } from '../common/entities/log-creditlimit.entity';

@Injectable()
export class MtajiService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(LogApplication) private readonly logApplicationRepository: Repository<LogApplication>,
    @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
    @InjectRepository(LogCreditLimit) private readonly logCreditLimitRepository: Repository<LogCreditLimit>,
    private readonly mailService: MailService,
  ) {
  }

  async closeCredit(customerId: number, userId: number): Promise<any> {
    const customer = await this.customerRepository.findOne(customerId);

    if (customer) {
      const history = await this.logCreditLimitRepository.findOne({
        where: {customer: customerId},
        order: {time: 'DESC'}
      });

      let changeFrom = customer.approvedCreditLimit;
      if (history) {
        changeFrom = history.changeTo;
      }

      const entity = Object.assign(new LogCreditLimit(), {
        time: new Date().toISOString(),
        type: CREDIT_CHANGE_TYPE.CLOSE,
        comment: closeCreditComment,
        changeFrom: changeFrom,
        customer: customer,
        user: userId,
      });

      await this.customerRepository.save(Object.assign(customer, {
        approvedCreditLimit: 0,
      }));

      await this.logCreditLimitRepository.save(entity);

      return 'success';
    }

    throw new HttpException(ERR_MESSAGES.ERR_CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  async changeCredit(changeCreditDto: ChangeCreditDto, customerId: number, userId: number): Promise<any> {
    const customer = await this.customerRepository.findOne(customerId);
    if (customer) {
      const history = await this.logCreditLimitRepository.findOne({
        where: {customer: customer},
        order: {time: 'DESC'}
      });

      let changeFrom = customer.approvedCreditLimit;
      if (history) {
        changeFrom = history.changeTo;
      }

      await this.customerRepository.save(Object.assign(customer, {
        approvedCreditLimit: changeCreditDto.credit,
      }));

      const entity = Object.assign(new LogCreditLimit(), {
        time: new Date().toISOString(),
        type: CREDIT_CHANGE_TYPE.CHANGE,
        changeFrom: changeFrom,
        changeTo: changeCreditDto.credit,
        comment: changeCreditDto.comment,
        customer: customer,
        user: userId,
      });

      await this.logCreditLimitRepository.save(entity);

      return 'success';
    }
    throw new HttpException(ERR_MESSAGES.ERR_CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }
}
