import {IRouterContext} from "koa-router";
import {jsonResponse} from "../utils";
import {RESPONSE_CODE, TIP_AMOUNT_MIN} from "@src/infrastructure/utils/constants";

export function CheckTipAmount() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async (ctx: IRouterContext, next: any) => {
      if (ctx.request.body.amount >= TIP_AMOUNT_MIN) {
        await fn(ctx, next);
      } else {
        ctx.body = jsonResponse({
          code: RESPONSE_CODE.ERROR,
          msg: `tip amount must be greater than or equal $${TIP_AMOUNT_MIN}`
        })
      }
    }
  }
}