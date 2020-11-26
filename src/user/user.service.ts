import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Partner } from './entities/partner.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ERR_MESSAGES, ROLES } from '../constant';
import { UpdateUserDto } from './dto/update-user.dto';
import { Customer } from './entities/customer.entity';
import { MailService } from '../services/mail/mail.service';
import * as generator from 'generate-password';
import { LogApplication } from '../common/entities/log-application.entity';
import { config } from '../config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Partner) private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>,
    @InjectRepository(LogApplication) private readonly logApplicationRepository: Repository<LogApplication>,
    private readonly mailService: MailService,
  ) {
  }

  /**
   * @description get user detail information by id
   */
  async getUserDetail(id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['partner', 'customer'],
    });
    if (user) {
      return user;
    }
    throw new HttpException(ERR_MESSAGES.ERR_USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<any> {
    let entity = updateUserDto;
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(config.auth.passwordLength);
      const password = await bcrypt.hash(updateUserDto.password, salt);
      entity = {
        ...updateUserDto,
        password: password
      };
    }
    return await this.userRepository.update({ id: id }, entity);
  }

  /**
   * @description get all users
   */
  async getAllUsers(): Promise<any> {
    return await this.userRepository.find({});
  }

  /**
   * @description mtaji global credit creates user whose role is partner or mtaji role
   */
  async createUser(createUserDto: CreateUserDto): Promise<any> {
    let entity;
    if (createUserDto.role === ROLES.PARTNER) {
      if (createUserDto.partner === -1) {
        throw new HttpException(ERR_MESSAGES.ERR_PARTNER_NOT_SELECTED, HttpStatus.BAD_REQUEST);
      }
      entity = createUserDto;
    } else {
      entity = Object.assign(createUserDto, { partner: null });
    }

    try {
      let password = this.generateRandomPassword();
      if (createUserDto.password) {
        password = createUserDto.password;
      }

      const user = Object.assign(new User(), { ...entity, password: password });
      await this.userRepository.save(user);

      this.mailService.sendRegistrationNotification(
        createUserDto.email,
        password,
        createUserDto.role,
      )
        .then(res => console.log(res))
        .catch(err => console.log(err));

      return user;
    } catch (e) {
      throw new HttpException(ERR_MESSAGES.ERR_INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * @description Generate a 6 character alphanumeric passwrod
   */
  private generateRandomPassword(): string {
    return generator.generate({
      length: 6,
      numbers: true,
    });
  }
}
