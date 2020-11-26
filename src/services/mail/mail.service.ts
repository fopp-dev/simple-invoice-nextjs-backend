import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { config } from '../../config';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import { join } from 'path';
import { ROLES } from '../../constant';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
  ) {
  }

  readHTMLFile = (path, callback) => {
    fs.readFile(path, { encoding: 'utf-8' }, function(err, html) {
      if (err) {
        throw err;
      } else {
        callback(null, html);
      }
    });
  };

  async sendRegistrationNotification(email: string, password: string, role: string): Promise<any> {
    const subject = config.email.subject;
    return new Promise((resolve, reject) => {
      let path = 'views/email/registration.hbs';
      if (role === ROLES.CUSTOMER) {
        path = 'views/email/customer-registration.hbs';
      }
      this.readHTMLFile(join(process.cwd(), path), (err, res) => {
        if (err) {
          reject('Email template parse Error');
        }

        const template = handlebars.compile(res);
        const context = {
          role: role,
          password: password,
        };
        const html = template(context);

        this
          .mailerService
          .sendMail({
            to: email,
            from: config.email.from, // sender address
            subject: subject, // Subject line
            html: html, // plain text
          })
          .then(() => {
            resolve('Successfully sent email');
          })
          .catch((err) => {
            reject('Email sent failed');
            console.log(err);
          });
      });
    });
  }

  async sendSubmitNotificationToPartner(emailList: string[], customerName: string): Promise<any> {
    const subject = config.email.subject;
    return new Promise((resolve, reject) => {
      let path = 'views/email/notification-partner.hbs';
      this.readHTMLFile(join(process.cwd(), path), (err, res) => {
        if (err) {
          reject('Email template parse Error');
        }

        const template = handlebars.compile(res);
        const context = {
          customerName,
        };
        const html = template(context);

        emailList.forEach((to, i, array) => {
          let message = {
            from: config.email.from, // sender address
            subject: subject, // Subject line
            html: html, // plain text
          };
          message['to'] = to;
          this
            .mailerService
            .sendMail(message)
            .then(() => {
              resolve('Successfully sent email');
            })
            .catch((err) => {
              reject('Email sent failed');
              console.log(err);
            });
        });
      });
    });
  }

  async sendSubmitNotificationToMtaji(emailList: string[], customerName: string, partnerName: string): Promise<any> {
    const subject = config.email.subject;
    return new Promise((resolve, reject) => {
      let path = 'views/email/notification-partner.hbs';
      this.readHTMLFile(join(process.cwd(), path), (err, res) => {
        if (err) {
          reject('Email template parse Error');
        }

        const template = handlebars.compile(res);
        const context = {
          customerName,
          partnerName,
        };
        const html = template(context);

        emailList.forEach((to, i, array) => {
          let message = {
            from: config.email.from, // sender address
            subject: subject, // Subject line
            html: html, // plain text
          };
          message['to'] = to;
          this
            .mailerService
            .sendMail(message)
            .then(() => {
              resolve('Successfully sent email');
            })
            .catch((err) => {
              reject('Email sent failed');
              console.log(err);
            });
        });
      });
    });
  }

  async sendActivationNotificationToCustomer(emailList: string[]): Promise<any> {
    const subject = config.email.subject;
    return new Promise((resolve, reject) => {
      let path = 'views/email/notification-customer.hbs';
      this.readHTMLFile(join(process.cwd(), path), (err, res) => {
        if (err) {
          reject('Email template parse Error');
        }

        const template = handlebars.compile(res);
        const html = template({});

        emailList.forEach((to, i, array) => {
          let message = {
            from: config.email.from, // sender address
            subject: subject, // Subject line
            html: html, // plain text
          };
          message['to'] = to;
          this
            .mailerService
            .sendMail(message)
            .then(() => {
              resolve('Successfully sent email');
            })
            .catch((err) => {
              reject('Email sent failed');
              console.log(err);
            });
        });
      });
    });
  }

  async sendResetPasswordNotification(email: string, password: string): Promise<any> {
    const subject = config.email.subject;
    return new Promise((resolve, reject) => {
      let path = 'views/email/reset-password.hbs';
      this.readHTMLFile(join(process.cwd(), path), (err, res) => {
        if (err) {
          reject('Email template parse Error');
        }

        const template = handlebars.compile(res);
        const context = {
          password: password,
        };
        const html = template(context);

        this
          .mailerService
          .sendMail({
            to: email,
            from: config.email.from, // sender address
            subject: subject, // Subject line
            html: html, // plain text
          })
          .then(() => {
            resolve('Successfully sent email');
          })
          .catch((err) => {
            reject('Email sent failed');
            console.log(err);
          });
      });
    });
  }
}
