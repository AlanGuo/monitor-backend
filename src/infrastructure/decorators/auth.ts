import { IRouterContext } from "koa-router";
import { unauthorized } from "../utils";

export function AuthRequired() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async (ctx: IRouterContext, next: any) => {
      if (!ctx.state.user) {
        unauthorized(ctx);
      } else {
        await fn(ctx, next);
      }
    }
  }
}