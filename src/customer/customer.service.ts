import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from '../user/entities/customer.entity';
import { Brackets, getRepository, Repository } from 'typeorm';
import { SaveStep1Dto } from './dto/save-step1.dto';
import { User } from '../user/entities/user.entity';
import * as shell from 'shelljs';
import {
  CUSTOMER_APPLICATION_STATUS,
  CUSTOMER_REGISTRATION_STEPS,
  ERR_MESSAGES,
  ROLES,
  UPLOADS_TEMP, uploadsCustomerApplication, uploadsCustomerApplicationField,
} from '../constant';
import { SaveStep2Dto } from './dto/save-step2.dto';
import { CustomerLoan } from './entities/customer-loan.entity';
import { CustomerAsset } from './entities/customer-asset.entity';
import { PersonDto } from './dto/person.dto';
import { CustomerPerson } from './entities/customer-person.entity';
import { SaveStep4Dto } from './dto/save-step4.dto';
import { MailService } from '../services/mail/mail.service';
import { LogApplication } from '../common/entities/log-application.entity';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import * as generator from 'generate-password';
import { ApproveApplicationDto } from './dto/approve-application.dto';
import { CustomerDocument } from './entities/customer-document.entity';
import { SubmitDocumentsDto } from './dto/submit-documents.dto';
import { Invoice } from '../common/entities/invoice.entity';
import { InvoiceInstallment } from '../common/entities/invoice-installment.entity';
import { PaymentInstallment } from '../common/entities/payment-installment.entity';
import { LogCreditLimit } from '../common/entities/log-creditlimit.entity';
import * as fs from 'fs';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(CustomerLoan) private readonly customerLoanRepository: Repository<CustomerLoan>,
    @InjectRepository(CustomerAsset) private readonly customerAssetRepository: Repository<CustomerAsset>,
    @InjectRepository(CustomerPerson) private readonly customerPersonRepository: Repository<CustomerPerson>,
    @InjectRepository(LogApplication) private readonly logApplicationRepository: Repository<LogApplication>,
    @InjectRepository(CustomerDocument) private readonly customerDocumentRepository: Repository<CustomerDocument>,
    @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceInstallment) private readonly invoiceInstallmentRepository: Repository<InvoiceInstallment>,
    @InjectRepository(PaymentInstallment) private readonly paymentInstallmentRepository: Repository<PaymentInstallment>,
    @InjectRepository(LogCreditLimit) private readonly logCreditLimitRepository: Repository<LogCreditLimit>,
    private readonly mailService: MailService,
  ) {
  }

  /**
   * @description partner registers new customer
   * @param registerCustomerDto
   * @param userId
   */
  async registerCustomer(registerCustomerDto: RegisterCustomerDto, userId: number): Promise<any> {
    const user = await this.userRepository.findOne({
      relations: ['partner'],
      where: {
        id: userId,
      },
    });
    if (user.partner) {
      try {
        const customer = await this.customerRepository.save({
          ...new Customer(), ...registerCustomerDto,
          partner: user.partner,
        });
        const password = this.generateRandomPassword();
        const entity = Object.assign(new User(),
          {
            email: registerCustomerDto.contactEmail,
            name: registerCustomerDto.name,
            enabled: true,
            password: password,
            role: ROLES.CUSTOMER,
            customer: customer.id,
          });

        const data = await this.userRepository.save(entity);

        this.mailService.sendRegistrationNotification(registerCustomerDto.contactEmail, password, ROLES.CUSTOMER)
          .then(res => {
            console.log('mail sent', res);
          })
          .catch(error => {
            console.log('mail error', error);
          });

        // save customer application log
        const logApplicationEntities = [
          Object.assign(new LogApplication(), {
            time: new Date().toISOString(),
            applicationStep: CUSTOMER_REGISTRATION_STEPS['1_CREATE_CUSTOMER'],
            status: CUSTOMER_APPLICATION_STATUS.COMPLETED,
            customer: data.customer,
            user: user,
          }),
          Object.assign(new LogApplication(), {
            time: new Date().toISOString(),
            applicationStep: CUSTOMER_REGISTRATION_STEPS['2_SUBMIT_APPLICATION'],
            status: CUSTOMER_APPLICATION_STATUS.STARTED,
            customer: data.customer,
          }),
        ];
        await this.logApplicationRepository.save(logApplicationEntities);

        return data;
      } catch (e) {
        console.log(e);
        throw new HttpException(ERR_MESSAGES.ERR_INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    throw new HttpException(ERR_MESSAGES.ERR_PARTNER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  /**
   * @description submit necessary information of customer
   * @param saveStep1Dto
   * @param customerId
   */
  async saveStep1(saveStep1Dto: SaveStep1Dto, customerId: number): Promise<any> {
    const customer = await this.customerRepository.findOne(customerId);
    if (customer) {
      const entity = Object.assign(customer, saveStep1Dto);
      return await this.customerRepository.save(entity);
    }

    throw new HttpException(ERR_MESSAGES.ERR_CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  /**
   * @description register assets and loans of customer
   * @param saveStep2Dto
   * @param customerId
   */
  async saveStep2(saveStep2Dto: SaveStep2Dto, customerId: number): Promise<any> {
    const customer = await this.customerRepository.findOne(customerId);

    if (customer) {
      // update customer with loans
      const entity = Object.assign(customer, saveStep2Dto, {
        assets: saveStep2Dto.assets || [],
        loans: saveStep2Dto.loans || [],
      });

      return await this.customerRepository.save(entity);
    }
    throw new HttpException(ERR_MESSAGES.ERR_CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  /**
   * @description register persons on customer
   * @param saveStep3Dto
   * @param customerId
   */
  async saveStep3(saveStep3Dto: PersonDto[], customerId: number): Promise<any> {
    const customer = await this.customerRepository.findOne(customerId);

    if (customer) {
      const entity = Object.assign(customer, { persons: saveStep3Dto });
      const data = await this.customerRepository.save(entity);
      return data.persons;
    }

    throw new HttpException(ERR_MESSAGES.ERR_CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  /**
   * @description submit documents
   * @param saveStep4Dto
   * @param customerId
   */
  async saveStep4(saveStep4Dto: SaveStep4Dto, customerId: number, authUser: any): Promise<any> {
    const customer = await getRepository(Customer).createQueryBuilder('customer')
      .where('customer.id = :customerId', {customerId})
      .leftJoinAndSelect('customer.documents', 'documents', 'documents.applicationStep = :applicationStep', {applicationStep: CUSTOMER_REGISTRATION_STEPS['2_SUBMIT_APPLICATION']})
      .leftJoin('customer.persons', 'persons')
      .leftJoinAndSelect('persons.documents', 'personsDocuments', 'personsDocuments.applicationStep = :applicationStep', {applicationStep: CUSTOMER_REGISTRATION_STEPS['2_SUBMIT_APPLICATION']})
      .select(['customer', 'persons' ,'personsDocuments'])
      .getOne();

    if (customer) {
      customer.documents = saveStep4Dto.documents;
      // move customer documents from temp to uploads
      for (let i = 0; i < saveStep4Dto.documents.length; i++) {
        if (saveStep4Dto.documents[i].filename.indexOf(UPLOADS_TEMP) !== -1) {
          if (!fs.existsSync(`./${saveStep4Dto.documents[i].filename}`)) {
            throw new HttpException(ERR_MESSAGES.ERR_FILE_NOT_EXIST, HttpStatus.NOT_FOUND);
          }

          try {
            const filenameArray = saveStep4Dto.documents[i].filename.split('\\');
            const tempFilename = filenameArray[filenameArray.length - 1];
            const newFilename = `${customerId}-${tempFilename}`;
            const newPath = uploadsCustomerApplication(customerId);
            const newPathField = uploadsCustomerApplicationField(customerId);

            if (!fs.existsSync(newPath)) {
              await shell.mkdir('-p', newPath);
            }

            fs.renameSync(`./${saveStep4Dto.documents[i].filename}`, `${newPath}/${newFilename}`);
            customer.documents[i]['filename'] = `${newPathField}/${newFilename}`;
          } catch (e) {
            throw new HttpException(ERR_MESSAGES.ERR_INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
          }
        }
      }

      for (let i = 0; i < saveStep4Dto.persons.length; i++) {
        const index = customer.persons.findIndex(item => item.id === saveStep4Dto.persons[i].id);
        if (index !== -1) {
          customer.persons[index].documents = saveStep4Dto.persons[i].documents;

          // move file to upload directory
          for (let j = 0; j < saveStep4Dto.persons[i].documents.length; j++) {
            if (saveStep4Dto.persons[i].documents[j].filename.indexOf(UPLOADS_TEMP) !== -1) {
              if (!fs.existsSync(`./${saveStep4Dto.persons[i].documents[j].filename}`)) {
                throw new HttpException(ERR_MESSAGES.ERR_FILE_NOT_EXIST, HttpStatus.NOT_FOUND);
              }

              try {
                const filenameArray = saveStep4Dto.persons[i].documents[j].filename.split('\\');
                const tempFilename = filenameArray[filenameArray.length - 1];
                const newFilename = `${customerId}-${tempFilename}`;
                const newPath = uploadsCustomerApplication(customerId);
                const newPathField = uploadsCustomerApplicationField(customerId);

                if (!fs.existsSync(newPath)) {
                  await shell.mkdir('-p', newPath);
                }

                fs.renameSync(`./${saveStep4Dto.persons[i].documents[j].filename}`, `${newPath}/${newFilename}`);
                customer.persons[index].documents[j]['filename'] = `${newPathField}/${newFilename}`;
              } catch (e) {
                throw new HttpException(ERR_MESSAGES.ERR_INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
              }
            }
          }
        }
      }

      await this.customerRepository.save(customer);

      return this.getCustomerDocuments(customerId, authUser);
    }

    throw new HttpException(ERR_MESSAGES.ERR_CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  /**
   * @submit step1 - 5 to partner
   * @param userId
   */
  async submitApplication(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({
      relations: ['customer', 'customer.persons', 'customer.logs', 'customer.partner', 'customer.partner.users'],
      where: { id: userId },
    });

    if (user) {
      if (user.customer) {
        const logApplication = await this.logApplicationRepository.findOne({
          customer: user.customer,
          applicationStep: CUSTOMER_REGISTRATION_STEPS['2_SUBMIT_APPLICATION'],
        });

        const logApplicationEntities = [
          // convert previous step status to completed
          Object.assign(logApplication, {
            status: CUSTOMER_APPLICATION_STATUS.COMPLETED,
            user: user,
          }),
          // add partner approve application as started
          {
            time: new Date().toISOString(),
            applicationStep: CUSTOMER_REGISTRATION_STEPS['3_PARTNER_APPROVE_APPLICATION'],
            status: CUSTOMER_APPLICATION_STATUS.STARTED,
            customer: user.customer,
          },
        ];
        await this.logApplicationRepository.save(logApplicationEntities);

        // const customer = await this.customerRepository.save(user.customer);
        const partnerUsers = user.customer.partner.users;
        const partnerUsersEmails = partnerUsers && partnerUsers.map(partnerUser => partnerUser.email);

        this.mailService
          .sendSubmitNotificationToPartner(partnerUsersEmails, user.customer.tradingName)
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
        return user.customer;
      }

      throw new HttpException(ERR_MESSAGES.ERR_CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    throw new HttpException(ERR_MESSAGES.ERR_USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  async approveApplication(approveApplicationDto: ApproveApplicationDto, customerId: number, authUser: any): Promise<any> {
    await this.checkPartnerHasCustomerAccess(authUser, customerId);

    const user = await this.userRepository.findOne({ id: authUser.id });
    const customer = await this.customerRepository.findOne({
      relations: ['persons'],
      where: {
        id: customerId,
      },
    });
    // customer persons' id array
    const customerPersonsId = customer && customer.persons && customer.persons.map(item => item.id);

    const customerDocuments = await getRepository(CustomerDocument).createQueryBuilder('customerDocument')
      .leftJoin('customerDocument.customer', 'customer')
      .leftJoin('customerDocument.person', 'person')
      .where(new Brackets(qb => {
        qb.where('customer.id = :customerId', { customerId: customerId })
          .orWhere('person.id in (:personIds)', { personIds: customerPersonsId });
      }))
      .andWhere('customerDocument.applicationStep = :applicationStep', { applicationStep: CUSTOMER_REGISTRATION_STEPS['2_SUBMIT_APPLICATION'] })
      .getMany();

    // set checked as true on customer uploaded document
    for (let i = 0; i < customerDocuments.length; i++) {
      customerDocuments[i].checked = true;
      customerDocuments[i].checkedByUser = user;
      customerDocuments[i].checkedTime = new Date().toISOString();
    }
    // save partner comment
    await this.customerRepository.update({ id: customerId }, {
      partnerComments: approveApplicationDto.partnerComments,
    });

    const signedDocuments: any = approveApplicationDto.documents;
    // move files from temp to uploads
    for (let i = 0; i < signedDocuments.length; i++) {
      if (signedDocuments[i].filename.indexOf(UPLOADS_TEMP) !== -1) {
        if (!fs.existsSync(`./${signedDocuments[i].filename}`)) {
          throw new HttpException(ERR_MESSAGES.ERR_FILE_NOT_EXIST, HttpStatus.NOT_FOUND);
        }

        try {
          const filenameArray = signedDocuments[i].filename.split('\\');
          const tempFilename = filenameArray[filenameArray.length - 1];
          const newFilename = `${customerId}-${tempFilename}`;
          const newPath = uploadsCustomerApplication(customerId);
          const newPathField = uploadsCustomerApplicationField(customerId);

          if (!fs.existsSync(newPath)) {
            await shell.mkdir('-p', newPath);
          }

          fs.renameSync(`./${signedDocuments[i].filename}`, `${newPath}/${newFilename}`);

          signedDocuments[i]['filename'] = `${newPathField}/${newFilename}`;
        } catch (e) {
          throw new HttpException(ERR_MESSAGES.ERR_INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    }

    await this.customerDocumentRepository.save([...customerDocuments, ...signedDocuments]);

    // update log application
    const logApplication = await this.logApplicationRepository.findOne({
      relations: ['customer'],
      where: {
        applicationStep: CUSTOMER_REGISTRATION_STEPS['3_PARTNER_APPROVE_APPLICATION'],
        customer: {
          id: customerId,
        },
        status: CUSTOMER_APPLICATION_STATUS.STARTED,
      },
    });

    if (logApplication) {
      logApplication.user = user;
      logApplication.status = CUSTOMER_APPLICATION_STATUS.COMPLETED;
      await this.logApplicationRepository.save([
        logApplication,
        {
          time: new Date().toISOString(),
          applicationStep: CUSTOMER_REGISTRATION_STEPS['8_SIGN_LOAN_DOCUMENTS'],
          status: CUSTOMER_APPLICATION_STATUS.STARTED,
          customer: {
            id: customerId,
          },
        },
      ]);
    } else { // this is when mtaji updates the customer registration steps on customer overview

    }

    return true;
  }

  async submitDocuments(submitDocumentsDto: SubmitDocumentsDto, customerId: number, authUser): Promise<any> {
    await this.checkPartnerHasCustomerAccess(authUser, customerId);

    const user = await this.userRepository.findOne({
      relations: ['partner'],
      where: {
        id: authUser.id,
      },
    });

    if (user) {
      const customer = await this.customerRepository.findOne({
        relations: ['persons', 'documents', 'persons.documents'],
        where: { id: customerId },
      });

      if (customer) {
        const docs = JSON.parse(JSON.stringify(customer.documents));

        const finalDocuments: any = submitDocumentsDto.documents;
        // move files from temp to uploads
        for (let i = 0; i < finalDocuments.length; i++) {
          if (finalDocuments[i].filename.indexOf(UPLOADS_TEMP) !== -1) {
            if (!fs.existsSync(`./${finalDocuments[i].filename}`)) {
              throw new HttpException(ERR_MESSAGES.ERR_FILE_NOT_EXIST, HttpStatus.NOT_FOUND);
            }

            try {
              const filenameArray = finalDocuments[i].filename.split('\\');
              const tempFilename = filenameArray[filenameArray.length - 1];
              const newFilename = `${customerId}-${tempFilename}`;
              const newPath = uploadsCustomerApplication(customerId);
              const newPathField = uploadsCustomerApplicationField(customerId);

              if (!fs.existsSync(newPath)) {
                await shell.mkdir('-p', newPath);
              }

              fs.renameSync(`./${finalDocuments[i].filename}`, `${newPath}/${newFilename}`);

              finalDocuments[i]['filename'] = `${newPathField}/${newFilename}`;
            } catch (e) {
              throw new HttpException(ERR_MESSAGES.ERR_INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
          }
        }

        // insert new signed customer's documents
        customer.documents = [...docs, ...finalDocuments];

        // insert new signed person's documents on each person
        for (let i = 0; i < submitDocumentsDto.persons.length; i++) {
          const index = customer.persons.findIndex(item => item.id === submitDocumentsDto.persons[i].id);
          if (index !== -1) {
            const docs = JSON.parse(JSON.stringify(customer.persons[index].documents));
            const personsFinalDocuments: any = submitDocumentsDto.persons[i].documents;

            // move files from temp to uploads
            for (let i = 0; i < personsFinalDocuments.length; i++) {
              if (personsFinalDocuments[i].filename.indexOf(UPLOADS_TEMP) !== -1) {
                if (!fs.existsSync(`./${personsFinalDocuments[i].filename}`)) {
                  throw new HttpException(ERR_MESSAGES.ERR_FILE_NOT_EXIST, HttpStatus.NOT_FOUND);
                }

                try {
                  const filenameArray = personsFinalDocuments[i].filename.split('\\');
                  const tempFilename = filenameArray[filenameArray.length - 1];
                  const newFilename = `${customerId}-${tempFilename}`;
                  const newPath = uploadsCustomerApplication(customerId);
                  const newPathField = uploadsCustomerApplicationField(customerId);

                  if (!fs.existsSync(newPath)) {
                    await shell.mkdir('-p', newPath);
                  }

                  fs.renameSync(`./${personsFinalDocuments[i].filename}`, `${newPath}/${newFilename}`);

                  finalDocuments[i]['filename'] = `${newPathField}/${newFilename}`;
                } catch (e) {
                  throw new HttpException(ERR_MESSAGES.ERR_INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
                }
              }
            }

            customer.persons[index].documents = [...docs, ...personsFinalDocuments];
          }
        }

        await this.customerRepository.save(customer);

        if (user.partner && user.role === ROLES.PARTNER) {
          // update application logs
          const logApplication = await this.logApplicationRepository.findOne({
            relations: ['customer'],
            where: {
              applicationStep: CUSTOMER_REGISTRATION_STEPS['8_SIGN_LOAN_DOCUMENTS'],
              customer: {
                id: customerId,
              },
              status: CUSTOMER_APPLICATION_STATUS.STARTED,
            },
          });

          if (logApplication) {
            logApplication.user = user;
            logApplication.status = CUSTOMER_APPLICATION_STATUS.COMPLETED;
            await this.logApplicationRepository.save([
              logApplication,
              {
                time: new Date().toISOString(),
                applicationStep: CUSTOMER_REGISTRATION_STEPS['9_APPROVE_CREDIT'],
                status: CUSTOMER_APPLICATION_STATUS.STARTED,
                customer: {
                  id: customerId,
                },
              },
            ]);

            // send notification to mtaji users
            const mtajiUsers = await this.userRepository.find({
              where: {
                role: ROLES.MTAJI_GLOBAL_CREDIT,
                enabled: true,
              },
            });
            const mtajiUsersEmails = mtajiUsers && mtajiUsers.map((item) => item.email);

            if (mtajiUsersEmails && mtajiUsersEmails.length > 0) {
              this.mailService
                .sendSubmitNotificationToMtaji(mtajiUsersEmails, customer.tradingName, user.partner.name)
                .then((res) => console.log(res))
                .catch((err) => console.log(err));
            }
          }
        }

        return true;
      }

      throw new HttpException(ERR_MESSAGES.ERR_CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    throw new HttpException(ERR_MESSAGES.ERR_USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  async activateCustomer(customerId: number, userId: number): Promise<any> {
    const customer = await this.customerRepository.findOne(customerId);

    if (!customer) {
      throw new HttpException(ERR_MESSAGES.ERR_CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    await this.customerRepository.save(Object.assign(customer, {
      openCreditLimit: customer.suggestedCredit,
      approvedCreditLimit: customer.suggestedCredit,
    }));

    const logApplication = await this.logApplicationRepository.findOne({
      where: {
        applicationStep: CUSTOMER_REGISTRATION_STEPS['9_APPROVE_CREDIT'],
        customer: {
          id: customerId,
        },
      },
    });

    await this.logApplicationRepository.save(Object.assign(logApplication, {
      status: CUSTOMER_APPLICATION_STATUS.COMPLETED,
      user: {
        id: userId,
      },
    }));

    const customerUsers = await this.userRepository.find({
      customer: {
        id: customerId,
      },
      enabled: true,
      role: ROLES.CUSTOMER,
    });
    const customerUsersEmail = customerUsers && customerUsers.map((item) => {
      return item.email;
    });

    if (customerUsersEmail && customerUsersEmail.length > 0) {
      this.mailService.sendActivationNotificationToCustomer(customerUsersEmail)
        .then(res => console.log(res))
        .catch(err => console.log(err));
    }
    return true;
  }

  async getAllCustomers(): Promise<any> {
    return await getRepository(Customer).createQueryBuilder('customer')
      .leftJoin('customer.logs', 'logs')
      .leftJoin('customer.users', 'users')
      .select([
        'customer',
        'logs',
        'users.id',
        'users.email',
        'users.name',
      ])
      .getMany();
  }

  async getCustomerPersons(customerId: number, authUser: any): Promise<any> {
    await this.checkPartnerHasCustomerAccess(authUser, customerId);

    const customer = await this.customerRepository.findOne({
      relations: ['persons', 'persons.phoneNumbers', 'persons.assets'],
      where: { id: customerId },
    });

    if (customer) {
      return customer.persons;
    }
    throw new HttpException(ERR_MESSAGES.ERR_CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  async getCustomerDocuments(customerId: number, authUser: any): Promise<any> {
    await this.checkPartnerHasCustomerAccess(authUser, customerId);

    const customer = await getRepository(Customer).createQueryBuilder('customer')
      .where({ id: customerId })
      .leftJoin('customer.documents', 'documents')
      .leftJoin('customer.persons', 'persons')
      .leftJoin('persons.documents', 'personDocuments')
      .select([
        'customer.id',
        'customer.tradingName',
        'customer.partnerComments',
        'documents',
        'persons.id',
        'persons.firstName',
        'persons.lastName',
        'personDocuments',
      ])
      .getOne();

    if (customer) {
      return customer;
    }
    throw new HttpException(ERR_MESSAGES.ERR_CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  async getCustomerMain(customerId: number, authUser: any): Promise<any> {
    await this.checkPartnerHasCustomerAccess(authUser, customerId);

    return await getRepository(Customer).createQueryBuilder('customer')
      .leftJoin('customer.assets', 'assets')
      .leftJoin('customer.loans', 'loans')
      .leftJoin('customer.users', 'users')
      .where({id: customerId})
      .select(['customer', 'assets', 'loans', 'users.name', 'users.email'])
      .getOne();
  }

  async getInstallmentsNotFullyPaid(customerId: number, authUser: any): Promise<any> {
    await this.checkPartnerHasCustomerAccess(authUser, customerId);

    return await getRepository(Invoice).createQueryBuilder('invoice')
      .leftJoin('invoice.customer', 'customer')
      .leftJoinAndSelect('invoice.installments', 'installments', 'installments.remaining > 0')
      .leftJoin('installments.invoice', 'installmentInvoice')
      .where({
        customer: { id: customerId },
      })
      .andWhere('invoice.remaining > 0')
      .select([
        'invoice.id',
        'customer.id',
        'installments',
        'installmentInvoice.id',
        'installmentInvoice.invoiceNumber',
        'installments.remaining',
      ])
      .getMany();
  }

  async getCreditChangeLog(customerId: number, authUser: any): Promise<any> {
    await this.checkPartnerHasCustomerAccess(authUser, customerId);

    return getRepository(LogCreditLimit).createQueryBuilder('logCreditLimit')
      .leftJoin('logCreditLimit.user', 'user')
      .leftJoin('logCreditLimit.customer', 'customer')
      .select(['user.name', 'logCreditLimit', 'customer.tradingName'])
      .where('customer.id = :customerId', { customerId })
      .orderBy({ time: 'DESC' })
      .getMany();
  }

  async getCustomerCredit(customerId: number, authUser: any): Promise<any> {
    await this.checkPartnerHasCustomerAccess(authUser, customerId);

    const creditInformation = await getRepository(Invoice).createQueryBuilder('invoice')
      .leftJoin('invoice.customer', 'customer')
      .where('customer.id = :customerId', { customerId })
      .select(['invoice.id, customer.approvedCreditLimit AS totalCredit, SUM(invoice.remaining) AS totalRemaining'])
      .groupBy('customer.id')
      .getRawOne();

    if (!creditInformation) {
      const customer = await this.customerRepository.findOne(customerId);

      if (customer) {
        return {
          totalCredit: customer.approvedCreditLimit,
          remaining: customer.approvedCreditLimit,
        };
      }
      throw new HttpException(ERR_MESSAGES.ERR_CUSTOMER_NOT_FOUND, HttpStatus.BAD_REQUEST);
    }

    return {
      remaining: parseFloat(creditInformation.totalCredit) - parseFloat(creditInformation.totalRemaining),
      totalCredit: parseFloat(creditInformation.totalCredit),
    };
  }

  async getNextPayment(customerId: number): Promise<any> {
    const nextRemaining = await getRepository(InvoiceInstallment).createQueryBuilder('invoiceInstallment')
      .where('invoiceInstallment.date > NOW() AND invoiceInstallment.remaining > 0')
      .leftJoin('invoiceInstallment.invoice', 'invoice')
      .leftJoin('invoice.customer', 'customer')
      .andWhere('customer.id = :customerId', {customerId})
      .select(['invoiceInstallment.date AS installmentDate, SUM(invoiceInstallment.remaining) AS nextRemaining'])
      .orderBy({'invoiceInstallment.date': 'ASC'})
      .groupBy('invoiceInstallment.date')
      .getRawOne();

    if (!nextRemaining) {
      throw new HttpException(ERR_MESSAGES.ERR_NEXT_PAYMENT_NOT_EXIST, HttpStatus.NOT_FOUND);
    }

    return nextRemaining;
  }

  /**
   * @description Generate a 6 character alphanumeric password
   */
  private generateRandomPassword(): string {
    return generator.generate({
      length: 6,
      numbers: true,
    });
  }

  private async checkPartnerHasCustomerAccess(authUser, customerId) {
    if (
      authUser.role === ROLES.MTAJI_GLOBAL_CREDIT ||
      authUser.role === ROLES.MTAJI_LOCAL_CREDIT ||
      authUser.role === ROLES.MTAJI_LOCAL_ADMIN ||
      authUser.role === ROLES.CUSTOMER
    ) {
      return true;
    }
    /**
     * check if there is customer whose id of partner is param partner id
     */
    const customer = await this.customerRepository.findOne({
      where: {
        id: customerId,
        partner: {
          id: authUser.partner.id,
        }
      },
      relations: ['partner']
    });

    if(!customer) {
      throw new HttpException(ERR_MESSAGES.ERR_NO_ACCESS, HttpStatus.FORBIDDEN);
    }
  }
}
