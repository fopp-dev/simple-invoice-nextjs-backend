import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES } from '../constant';

@Injectable()
export class CustomerIsMeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role === ROLES.CUSTOMER) {
      const customerId = request.params.customerId;
      return (parseInt(customerId) === parseInt(user.customer.id));
    } else {
      return true;
    }
  }
}
