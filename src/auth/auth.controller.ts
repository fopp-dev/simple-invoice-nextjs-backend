import { Body, Controller, HttpStatus, Post, Res, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MysqlExceptionFilter } from '../filters/mysql-exception.filter';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dtio';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @ApiTags('auth')
  @ApiOperation({
    description: 'login user'
  })
  @Post('login')
  @UseFilters(MysqlExceptionFilter)
  async login(@Body() loginDto: LoginDto, @Res() res: any) {
    const response = await this.authService.login(loginDto);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }

  @ApiTags('auth')
  @ApiOperation({
    description: 'reset password'
  })
  @Post('reset-password')
  @UseFilters(MysqlExceptionFilter)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res: any) {
    const response = await this.authService.resetPassword(resetPasswordDto);

    if (response) {
      return res.status(HttpStatus.OK).json({
        statusCode: 200,
        response,
      });
    }
  }
}
