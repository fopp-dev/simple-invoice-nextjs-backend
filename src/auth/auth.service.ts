import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ERR_MESSAGES } from '../constant';
import { ResetPasswordDto } from './dto/reset-password.dtio';
import * as generator from 'generate-password';
import { config } from '../config';
import { MailService } from '../services/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {
  }

  /**
   * @description login any type of user
   * @param loginDto
   */
  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.userRepository.findOne({
      relations: ['customer', 'customer.logs', 'partner', 'customer.partner'],
      where: {
        email: loginDto.email,
        enabled: true,
      },
    });

    if (user) {
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

      if (isPasswordValid) {
        let payload = {
          id: user.id,
          email: user.email,
          role: user.role,
        };

        if (user.customer) {
          payload['customer'] = {
            id: user.customer.id,
            tradingName: user.customer.tradingName,
          };

          if (user.customer.partner) {
            payload['customer']['partner'] = {
              id: user.customer.partner.id,
            };
          }
        }

        if (user.partner) {
          payload['partner'] = {
            id: user.partner.id,
            name: user.partner.name,
          };
        }

        return {
          token: this.jwtService.sign(payload),
          customer: user.customer,
        };
      }
      throw new HttpException(ERR_MESSAGES.ERR_AUTH_PASSWORD_NOT_CORRECT, HttpStatus.BAD_REQUEST);
    }
    throw new HttpException(ERR_MESSAGES.ERR_AUTH_ERR_USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        email: resetPasswordDto.email,
      },
    });

    if (!user) {
      throw new HttpException(ERR_MESSAGES.ERR_USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const newPassword = this.generateRandomPassword();
    const salt = await bcrypt.genSalt(config.auth.passwordLength);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(Object.assign(user, {
      password: newPasswordHash,
    }));

    this.mailService.sendResetPasswordNotification(resetPasswordDto.email, newPassword)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));

    return 'success';
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
}
