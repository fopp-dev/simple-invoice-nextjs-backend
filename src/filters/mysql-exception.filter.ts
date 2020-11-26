import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class MysqlExceptionFilter<T> implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    console.log('MysqlExceptionFilter<T> -> exception', exception);

    switch (exception.code) {
      case 'ER_DUP_ENTRY':
        if (exception.message.includes('@')) {
          response.status(HttpStatus.CONFLICT).json({
            error: true,
            sqlMessage: exception.sqlMessage,
            message: 'Email already exists. Please try with a different email'
          });
        }
        break;
      case 'ER_NO_DEFAULT_FOR_FIELD':
        response.status(HttpStatus.BAD_REQUEST).json({
          error: true,
          sqlMessage: exception.sqlMessage,
          message: exception.sqlMessage
        })
        break;
    }
  }
}
