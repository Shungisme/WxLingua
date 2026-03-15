import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthUser,
  AuthenticatedRequest,
} from '../../shared/types/auth-user.type';

export const CURRENT_USER_KEY = 'user';
export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user as AuthUser;
  },
);
