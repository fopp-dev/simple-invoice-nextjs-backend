import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { Partner } from '../user/entities/partner.entity';
import {
  ERR_MESSAGES,
  PARTNER_DOCUMENT_TYPES,
  UPLOADS_TEMP,
  uploadsCustomerInvoices,
  uploadsCustomerInvoicesField, uploadsPartnerBankStatement, uploadsPartnerBankStatementField,
} from '../constant';
import { User } from '../user/entities/user.entity';
import { Customer } from '../user/entities/customer.entity';
import { CustomerDocument } from '../customer/entities/customer-document.entity';
import { MailService } from '../services/mail/mail.service';
import { LogApplication } from '../common/entities/log-application.entity';
import { RegisterInvoiceDto } from './dto/register-invoice.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { AddBankStatementDto } from './dto/add-bank-statement.dto';
import { Invoice } from '../common/entities/invoice.entity';
import { InvoiceInstallment } from '../common/entities/invoice-installment.entity';
import { Payment } from '../common/entities/payment.entity';
import { PaymentInstallment } from '../common/entities/payment-installment.entity';
import PeriodDto from './dto/period.dto';
import { PartnerDocument } from './entities/partner-document.entity';
import { UpdateInstallmentCommentDto } from './dto/update-installment-comment.dto';
import * as fs from 'fs';
import * as shell from 'shelljs';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner) private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
    @InjectRepository(CustomerDocument) private readonly customerDocumentRepository: Repository<CustomerDocument>,
    @InjectRepository(LogApplication) private readonly logApplicationRepository: Repository<LogApplication>,
    @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceInstallment) private readonly invoiceInstallmentRepository: Repository<InvoiceInstallment>,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentInstallment) private readonly paymentInstallmentRepository: Repository<PaymentInstallment>,
    @InjectRepository(PartnerDocument) private readonly partnerDocumentRepository: Repository<PartnerDocument>,
    private readonly mailService: MailService,
  ) {
  }

  /**
   * @description get all partners
   */
  async getAllPartners(): Promise<any> {
    return await this.partnerRepository.find({});
  }

  async getPartnerCustomers(partnerId: number): Promise<any> {
    const partner = await getRepository(Partner).createQueryBuilder('partner')
      .where({ id: partnerId })
      .leftJoin('partner.customers', 'customers')
      .leftJoin('customers.users', 'customerUsers')
      .leftJoin('customers.logs', 'customerLogs')
      .select([
        'partner.id',
        'customers.id',
        'customers.tradingName',
        'customerUsers',
        'customerLogs',
      ])
      .getOne();

    if (partner) {
      return partner.customers;
    }
    throw new HttpException(ERR_MESSAGES.ERR_PARTNER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  async registerInvoice(registerInvoiceDto: RegisterInvoiceDto, user: any): Promise<any> {
    await this.checkPartnerHasCustomerAccess(user.partner.id, registerInvoiceDto.customer);
    // check invoice amount is same with sum of installments
    const amount = registerInvoiceDto.amount;
    let installments = registerInvoiceDto.installments;
    let sum = 0;
    installments.map(installment => {
      sum += installment.amount;
      installment['remaining'] = installment.amount;
    });

    if (sum !== amount) {
      throw new HttpException(ERR_MESSAGES.ERR_INVOICE_AMOUNT_NOT_CORRECT, HttpStatus.BAD_REQUEST);
    }


    // move temp invoice file into uploads directory
    let movedFilesPath = {};
    if (registerInvoiceDto.filenameInvoice.indexOf(UPLOADS_TEMP) !== -1) {
      if (!fs.existsSync(`./${registerInvoiceDto.filenameInvoice}`)) {
        throw new HttpException(ERR_MESSAGES.ERR_FILE_NOT_EXIST, HttpStatus.NOT_FOUND);
      }

      try {
        const filenameArray = registerInvoiceDto.filenameInvoice.split('\\');
        const tempFilename = filenameArray[filenameArray.length - 1];
        const newFilename = `${registerInvoiceDto.customer}-${tempFilename}`;
        const newInvoicePath = uploadsCustomerInvoices(registerInvoiceDto.customer);
        const newInvoicePathField = uploadsCustomerInvoicesField(registerInvoiceDto.customer);

        if (!fs.existsSync(newInvoicePath)) {
          await shell.mkdir('-p', newInvoicePath);
        }

        fs.renameSync(`./${registerInvoiceDto.filenameInvoice}`, `${newInvoicePath}/${newFilename}`);
        movedFilesPath['filenameInvoice'] = `${newInvoicePathField}/${newFilename}`;
      } catch (e) {
        throw new HttpException(ERR_MESSAGES.ERR_INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    // move temp excel file into uploads directory
    if (registerInvoiceDto.filenameExcel.indexOf(UPLOADS_TEMP) !== -1) {
      if (!fs.existsSync(`./${registerInvoiceDto.filenameExcel}`)) {
        throw new HttpException(ERR_MESSAGES.ERR_FILE_NOT_EXIST, HttpStatus.NOT_FOUND);
      }

      try {
        const filenameArray = registerInvoiceDto.filenameExcel.split('\\');
        const tempFilename = filenameArray[filenameArray.length - 1];
        const newFilename = `${registerInvoiceDto.customer}-${tempFilename}`;
        const newExcelPath = uploadsCustomerInvoices(registerInvoiceDto.customer);
        const newExcelPathField = uploadsCustomerInvoicesField(registerInvoiceDto.customer);

        if (!fs.existsSync(newExcelPath)) {
          await shell.mkdir('-p', newExcelPath);
        }

        fs.renameSync(`./${registerInvoiceDto.filenameExcel}`, `${newExcelPath}/${newFilename}`);
        movedFilesPath['filenameExcel'] = `${newExcelPathField}/${newFilename}`;
      } catch (e) {
        throw new HttpException(ERR_MESSAGES.ERR_INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    const entity = Object.assign(
      new Invoice(),
      registerInvoiceDto,
      {
        remaining: registerInvoiceDto.amount,
      },
      movedFilesPath,
    );

    return await this.invoiceRepository.save(entity);
  }

  async registerPayment(registerPaymentDto: RegisterPaymentDto, customerId: number, user: any): Promise<any> {
    await this.checkPartnerHasCustomerAccess(user.partner.id, customerId);

    let invoiceInstallmentEntities = [];

    for (let i = 0; i < registerPaymentDto.paymentInstallments.length; i++) {
      let entity = await this.invoiceInstallmentRepository.findOne({
        where: {
          id: registerPaymentDto.paymentInstallments[i].invoiceInstallment,
        },
        relations: ['invoice'],
      });

      // if remaining amount is less than payment amount
      if (parseFloat((entity.remaining).toString()) < parseFloat((registerPaymentDto.paymentInstallments[i].amount).toString())) {
        throw new HttpException(ERR_MESSAGES.ERR_PAYMENT_INSTALLMENT_AMOUNT_INVALID, HttpStatus.BAD_REQUEST);
      }
      // decrease remaining amount on invoice installment
      entity.remaining = parseFloat((entity.remaining).toString()) -
        parseFloat((registerPaymentDto.paymentInstallments[i].amount).toString());

      // if remaining amount is less than payment amount
      if (parseFloat((entity.invoice.remaining).toString()) < parseFloat((registerPaymentDto.paymentInstallments[i].amount).toString())) {
        throw new HttpException(ERR_MESSAGES.ERR_PAYMENT_INSTALLMENT_AMOUNT_INVALID, HttpStatus.BAD_REQUEST);
      }
      // decrease paid amount on invoice
      entity.invoice.remaining = parseFloat((entity.invoice.remaining).toString()) -
        parseFloat((registerPaymentDto.paymentInstallments[i].amount).toString());

      invoiceInstallmentEntities.push(entity);

      await this.invoiceRepository.save(entity.invoice);
    }

    const paymentEntity = new Payment();
    await this.paymentRepository.save(Object.assign(paymentEntity, registerPaymentDto));

    await this.invoiceInstallmentRepository.save(invoiceInstallmentEntities);

    return 'success';
  }

  async addBankStatement(addBankStatementDto: AddBankStatementDto, userId: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['partner'],
    });

    if (user) {
      if (user.partner) {
        // move temp invoice file into uploads directory
        let movedFilesPath = {};
        if (addBankStatementDto.filename.indexOf(UPLOADS_TEMP) !== -1) {
          if (!fs.existsSync(`./${addBankStatementDto.filename}`)) {
            throw new HttpException(ERR_MESSAGES.ERR_FILE_NOT_EXIST, HttpStatus.NOT_FOUND);
          }

          try {
            const filenameArray = addBankStatementDto.filename.split('\\');
            const tempFilename = filenameArray[filenameArray.length - 1];
            const newFilename = `${user.partner.id}-${tempFilename}`;
            const newPath = uploadsPartnerBankStatement(user.partner.id);
            const newPathField = uploadsPartnerBankStatementField(user.partner.id);

            if (!fs.existsSync(newPath)) {
              await shell.mkdir('-p', newPath);
            }

            fs.renameSync(`./${addBankStatementDto.filename}`, `${newPath}/${newFilename}`);
            movedFilesPath['filename'] = `${newPathField}/${newFilename}`;
          } catch (e) {
            throw new HttpException(ERR_MESSAGES.ERR_INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }
        await this.partnerDocumentRepository.save(
          Object.assign(
            new PartnerDocument(),
            addBankStatementDto,
            movedFilesPath,
            {
              partner: user.partner,
              type: PARTNER_DOCUMENT_TYPES.BANK_STATEMENT,
            }),
        );

        return 'success';
      }

      throw new HttpException(ERR_MESSAGES.ERR_PARTNER_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }
    throw new HttpException(ERR_MESSAGES.ERR_USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  async getFutureInstallments(partnerId: number, customerId: number, periodDto: PeriodDto): Promise<any> {
    await this.checkPartnerHasCustomerAccess(partnerId, customerId);

    let queryBuilder = getRepository(Customer).createQueryBuilder('customer')
      .leftJoin('customer.partner', 'partner')
      .where('partner.id = :partnerId', { partnerId })
      .leftJoin('customer.invoices', 'invoices')
      .leftJoinAndSelect('invoices.installments', 'installments', 'installments.date >= :startDate AND installments.date <= :endDate AND installments.remaining > 0',
        { startDate: periodDto.startDate, endDate: periodDto.endDate })
      .select(['customer.id', 'customer.tradingName', 'installments', 'invoices.invoiceNumber', 'installments.id AS installment_id', 'installments.comment AS installment_comment'])
      .andWhere('installments.date IS NOT NULL');

    if (customerId != -1) {
      queryBuilder = queryBuilder.andWhere('customer.id = :customerId', { customerId });
    }

    return await queryBuilder.getRawMany();
  }

  async getPastInstallments(partnerId: number, customerId: number, periodDto: PeriodDto): Promise<any> {
    await this.checkPartnerHasCustomerAccess(partnerId, customerId);

    let queryBuilder = getRepository(Customer).createQueryBuilder('customer')
      .leftJoin('customer.partner', 'partner')
      .where('partner.id = :partnerId', { partnerId })
      .leftJoinAndSelect('customer.payments', 'payments', 'payments.date >= :startDate AND payments.date <= :endDate',
        { startDate: periodDto.startDate, endDate: periodDto.endDate })
      .leftJoinAndSelect('payments.paymentInstallments', 'paymentInstallments')
      .leftJoin('paymentInstallments.invoiceInstallment', 'installment')
      .leftJoin('installment.invoice', 'invoice')
      .select(['customer.id', 'customer.tradingName', 'payments.date', 'paymentInstallments', 'invoice.invoiceNumber', 'installment.id AS installment_id', 'installment.comment AS installment_comment'])
      .andWhere('payments.date IS NOT NULL');

    if (customerId != -1) {
      queryBuilder = queryBuilder.andWhere('customer.id = :customerId', { customerId });
    }

    return await queryBuilder.getRawMany();
  }

  async getInvoices(partnerId: number, customerId: number, periodDto: PeriodDto): Promise<any> {
    await this.checkPartnerHasCustomerAccess(partnerId, customerId);

    let queryBuilder = getRepository(Invoice).createQueryBuilder('invoice')
      .leftJoin('invoice.customer', 'customer')
      .leftJoin('customer.partner', 'partner')
      .where('partner.id = :partnerId', { partnerId })
      .andWhere('invoice.date >= :startDate AND invoice.date < :endDate',
        { startDate: periodDto.startDate, endDate: periodDto.endDate })
      .select(['customer.tradingName', 'invoice']);

    if (customerId != -1) {
      queryBuilder = queryBuilder.andWhere('customer.id = :customerId', { customerId });
    }

    return await queryBuilder.getMany();
  }

  async getPartnerCredit(partnerId: number): Promise<any> {
    const creditInformation = await getRepository(Invoice).createQueryBuilder('invoice')
      .leftJoin('invoice.customer', 'customer')
      .leftJoin('customer.partner', 'partner')
      .where('partner.id = :partnerId', { partnerId })
      // .andWhere('invoice.remaining = 0')
      .select(['invoice.id, partner.openCreditLimit AS totalCredit, SUM(invoice.remaining) AS totalRemaining'])
      .groupBy('partner.id')
      .getRawOne();

    if (!creditInformation) {
      const partner = await this.partnerRepository.findOne(partnerId);

      if (partner) {
        return {
          totalCredit: partner.openCreditLimit,
          remaining: partner.openCreditLimit,
        };
      }
      throw new HttpException(ERR_MESSAGES.ERR_PARTNER_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    return {
      remaining: parseFloat(creditInformation.totalCredit) - parseFloat(creditInformation.totalRemaining),
      totalCredit: creditInformation.totalCredit,
    };
  }

  async updateInstallmentComment(installmentId: number, updateInstallmentCommentDto: UpdateInstallmentCommentDto): Promise<any> {
    await this.invoiceInstallmentRepository.update({ id: installmentId }, {
      comment: updateInstallmentCommentDto.comment,
    });

    return 'success';
  }

  /**
   * @description check if partner can access customer data
   * @param partnerId
   * @param customerId
   */
  private async checkPartnerHasCustomerAccess(partnerId, customerId) {
    if (customerId === '-1') {
      return true;
    }

    // get customer whose partner id is param partnerId
    const customer = await this.customerRepository.findOne({
      where: {
        id: customerId,
        partner: {
          id: partnerId,
        },
      },
      relations: ['partner'],
    });
    // if customer not exist, this means that partner doesn't have the access on this customer
    if (!customer) {
      throw new HttpException(ERR_MESSAGES.ERR_NO_ACCESS, HttpStatus.FORBIDDEN);
    }
  }
}
