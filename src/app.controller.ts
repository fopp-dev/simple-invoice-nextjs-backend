import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import {join} from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @ApiExcludeEndpoint()
  @Get([
    '/',
    '/signin',
    '/reset',
    '/partner-dashboard',
    '/customer-register',
    '/approve-application/*',
    '/final-document-sign/*',
    '/register-sales',
    '/register-payment',
    '/upload-bank-statement',
    '/customer-dashboard',
    '/mtaji-dashboard',
    '/mtaji-user-administration',
    '/create-user',
    '/edit-user/*',
    '/activate-credit/*',
    '/close-credit/*',
    '/change-credit/*',
    '/customer-overview/*',
    '/customer-step*',
    '/customer-not-activated',
  ])
  async getHello(@Res() res: any): Promise<any> {
    res.sendFile(join(process.cwd(), 'views/front/index.html'));
  }

  @ApiExcludeEndpoint()
  @Get('uploads-temp/:fileId')
  async serveTempFile(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, { root: 'uploads-temp' });
  }

  @ApiExcludeEndpoint()
  @Get('uploads/*')
  async serveFile(@Req() req, @Res() res): Promise<any> {
    const path = req.params[0];
    console.log(path);

    res.sendFile(path, { root: 'uploads' });
  }
}
