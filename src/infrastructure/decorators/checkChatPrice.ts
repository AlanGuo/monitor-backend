import {IRouterContext} from "koa-router";
import {jsonResponse} from "../utils";
import {
  CHAT_PRICE_MAX,
  CHAT_PRICE_MIN,
  RESPONSE_CODE,
} from "@src/infrastructure/utils/constants";

export function CheckChatPrice() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async (ctx: IRouterContext, next: any) => {
      if (ctx.request.body.chatPrice) {
        if (ctx.request.body.chatPrice >= CHAT_PRICE_MIN && ctx.request.body.chatPrice <= CHAT_PRICE_MAX) {
          await fn(ctx, next);
        } else {
          ctx.body = jsonResponse({
            code: RESPONSE_CODE.ERROR,
            msg: `chat price must be greater than or equal $${CHAT_PRICE_MIN} and less than or equal $${CHAT_PRICE_MAX}`
          })
        }
      } else {
        await fn(ctx, next);
      }

    }
  }
}