import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    let request;
    if (ctx.getType() as string === 'graphql') {
      const gqlContext = GqlExecutionContext.create(ctx).getContext();
      request = gqlContext.req;
    } else {
      request = ctx.switchToHttp().getRequest();
    }
    return request?.tenantId || request?.user?.tenantId;
  },
);
