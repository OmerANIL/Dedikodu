import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class PlatinumGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user?.subscriptionLevel !== 'platinum') {
      throw new ForbiddenException('Platinum subscription required');
    }
    return true;
  }
}
