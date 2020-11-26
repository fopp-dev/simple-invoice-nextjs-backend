import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES } from '../constant';

@Injectable()
export class PartnerIsMeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role === ROLES.PARTNER) {
      const partnerId = request.params.partnerId;
      return (parseInt(partnerId) === parseInt(user.partner.id));
    } else {
      return true;
    }
  }
}
