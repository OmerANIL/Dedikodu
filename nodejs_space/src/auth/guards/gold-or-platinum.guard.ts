import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class GoldOrPlatinumGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user?.subscriptionLevel !== 'gold' && user?.subscriptionLevel !== 'platinum') {
      throw new ForbiddenException('Gold or Platinum subscription required to create gossips');
    }
    return true;
  }
}
