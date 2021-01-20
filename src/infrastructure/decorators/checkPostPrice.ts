import {IRouterContext} from "koa-router";
import {jsonResponse} from "../utils";
import {
  POST_PRICE_MAX,
  POST_PRICE_MIN,
  RESPONSE_CODE,
} from "@src/infrastructure/utils/constants";

export function CheckPostPrice() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async (ctx: IRouterContext, next: any) => {
      if (ctx.request.body.price) {
        if (ctx.request.body.price >= POST_PRICE_MIN && ctx.request.body.price <= POST_PRICE_MAX) {
          await fn(ctx, next);
        } else {
          ctx.body = jsonResponse({
            code: RESPONSE_CODE.ERROR,
            msg: `post price must be greater than or equal $${POST_PRICE_MIN} and less than or equal $${POST_PRICE_MAX}`
          })
        }
      } else {
        await fn(ctx, next);
      }
    }
  }
}