import { IRouterContext } from "koa-router";
import { unauthorized } from "../utils";

export function AuthRequired() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async (ctx: IRouterContext, next: any) => {
      if (!ctx.state.user) {
        // 模拟本地登录态
        ctx.state.user = {
          uuid: 10000011
        }
        await fn(ctx, next);
        //unauthorized(ctx);
      } else {
        await fn(ctx, next);
      }
    }
  }
}