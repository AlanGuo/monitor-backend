import { IRouterContext } from "koa-router";

export function jsonResponse({data, code, msg}: {data?: any, code?: number, msg?: string} = {}) {
  return {
    code: code || 0,
    data: data ? data:undefined,
    msg: msg || ""
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function unauthorized(ctx: IRouterContext){
  ctx.throw(401, "Unauthorized");
}
