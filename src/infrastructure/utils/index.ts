import { IRouterContext } from "koa-router";

export function jsonResponse({data, code, msg}: {data?: any, code?: number, msg?: string} = {}) {
  return {
    code: code || 0,
    data: data ? data:undefined,
    msg: msg || ""
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function queryToPagination ({ page = 1, size = 50 }) {
  size = Number(size);
  size = size > 500 ? 500 : size;

  return {
    offset: (page - 1) * size,
    limit: size,

    page: Number(page),
    size: size
  }
}

export function unauthorized(ctx: IRouterContext){
  ctx.throw(401, "Unauthorized");
}
