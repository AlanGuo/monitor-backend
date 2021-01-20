import {IRouterContext} from "koa-router";
import {jsonResponse} from "../utils";
import {DEPOSIT_AMOUNT_MIN, RESPONSE_CODE} from "@src/infrastructure/utils/constants";

export function CheckPaypalDepositAmount() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async (ctx: IRouterContext, next: any) => {
      if (ctx.request.body.amount >= DEPOSIT_AMOUNT_MIN) {
        await fn(ctx, next);
      } else {
        ctx.body = jsonResponse({
          code: RESPONSE_CODE.ERROR,
          msg: `tip amount must be greater than or equal $${DEPOSIT_AMOUNT_MIN}`
        })
      }
    }
  }
}