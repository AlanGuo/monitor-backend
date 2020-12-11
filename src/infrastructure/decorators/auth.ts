import {IRouterContext} from "koa-router";
import {unauthorized} from "../utils";

export function AuthRequired(require = true) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async (ctx: IRouterContext, next: any) => {
      if (ctx.state.user) {
        await fn(ctx, next);
      } else if (!require) {
        await fn(ctx, next);
      } else {
        // 模拟本地登录态
        // ctx.state.user = {
        //   uuid: 10000003
        // }
        // await fn(ctx, next);
        unauthorized(ctx);
      }
    }
  }
}