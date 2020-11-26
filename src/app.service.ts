import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash('123456', salt);
  }
}
