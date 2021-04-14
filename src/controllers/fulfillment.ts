import { Controller, GET, PUT } from "@src/infrastructure/decorators/koa";
import { PaginationDec } from "@src/infrastructure/decorators/pagination";
import { Pagination } from "@src/interface";
import { IRouterContext } from "koa-router";
import fullfilmentModel, { IFulfillment } from "@src/models/fulfillment";
import { jsonResponse } from "@src/infrastructure/utils";
import { RESPONSE_CODE } from "@src/infrastructure/utils/constants";
import config from "@src/infrastructure/utils/config";
import {Types} from "mongoose";

@Controller({ prefix: "/fulfillments" })
export default class fulfillmentController {

  @PaginationDec()
  @GET("/task/:id")
  async getRunningRecord(ctx: IRouterContext) {
    const pagination: Pagination = ctx.state.pagination;
    const fields = {
      datetime: 1,
      exchange: 1,
      symbol: 1,
      side: 1,
      position: 1,
      price: 1,
      volume: 1,
      fill: 1
    };
    const fills = await fullfilmentModel.find({
    }, fields).sort({ _id: -1 }).skip(pagination.offset).limit(pagination.limit);
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL, data: {fills} });
  }
}
