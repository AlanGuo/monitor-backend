import { IRouterContext } from "koa-router";
import {queryToPagination} from "../utils";

export function PaginationDec() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const fn = descriptor.value;
    descriptor.value = async (ctx: IRouterContext, next: any) => {
      ctx.state.pagination = queryToPagination(ctx.query);
      await fn(ctx, next);
    }
  }
}
