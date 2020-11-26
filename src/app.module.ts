import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { config } from './config';
import { CustomerModule } from './customer/customer.module';
import { UploadModule } from './upload/upload.module';
import { PartnerModule } from './partner/partner.module';
import { MtajiModule } from './mtaji/mtaji.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    JwtModule.register({
      secret: "mtaji secret",
      signOptions: { expiresIn: config.jwt.expiresIn },
    }),
    UserModule,
    AuthModule,
    MailerModule.forRoot({
      transport: {
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        requireTLS: true,
        name: "ma15-mtaji",
        //sendmail: true,
        auth: {
          user: config.email.username,
          pass: config.email.password
        },
        tls: {
          rejectUnauthorized: false,
          // ciphers:'SSLv3',
        },
        logger: true,
        debug: true,
      },
    }),
    CustomerModule,
    UploadModule,
    PartnerModule,
    MtajiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})
export class AppModule {
}
