import {IRouterContext} from "koa-router";
import {jsonResponse} from "../utils";
import {RESPONSE_CODE, SUB_PRICE_MAX, SUB_PRICE_MIN} from "@src/infrastructure/utils/constants";

export function CheckSubPrice() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async (ctx: IRouterContext, next: any) => {
      if (ctx.request.body.subPrice) {
        if (ctx.request.body.subPrice >= SUB_PRICE_MIN && ctx.request.body.subPrice <= SUB_PRICE_MAX) {
          await fn(ctx, next);
        } else {
          ctx.body = jsonResponse({
            code: RESPONSE_CODE.ERROR,
            msg: `sub price must be greater than or equal $${SUB_PRICE_MIN} and less than or equal $${SUB_PRICE_MAX}`
          })
        }
      } else {
        await fn(ctx, next);
      }
    }
  }
}