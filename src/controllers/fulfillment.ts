import { Controller, GET, PUT } from "@src/infrastructure/decorators/koa";
import { PaginationDec } from "@src/infrastructure/decorators/pagination";
import { Pagination } from "@src/interface";
import { IRouterContext } from "koa-router";
import recordModel, { IRecord } from "@src/models/record";
import fullfilmentModel, { IFulfillment } from "@src/models/fulfillment";
import { jsonResponse } from "@src/infrastructure/utils";
import { RESPONSE_CODE } from "@src/infrastructure/utils/constants";
import config, { FINACIAL } from "@src/infrastructure/utils/config";
import { Types } from "mongoose";

@Controller({ prefix: "/fulfillments" })
export default class fulfillmentController {

  @GET("/task/:id")
  @PaginationDec()
  async getRunningRecord(ctx: IRouterContext) {
    const pagination: Pagination = ctx.state.pagination;
    const query = ctx.query;
    const fields = {
      task_id: 1,
      datetime: 1,
      exchange: 1,
      symbol: 1,
      side: 1,
      position: 1,
      price: 1,
      volume: 1,
      fill: 1
    };
    const filter: any = {
      task_id: Types.ObjectId(ctx.params.id)
    };
    if (query.fulfill && query.fulfill.toLowerCase() == "false") {
      const record = await recordModel.find({"_id": ctx.params.id}).limit(1);
      filter.fill  = {
        $expr: { $lt: [ "$fill" , "$volume" ] } 
      }
    }
    console.log(filter);
    const fills = await fullfilmentModel.find(filter, fields).sort({ _id: -1 }).skip(pagination.offset).limit(pagination.limit);
    const total = await fullfilmentModel.countDocuments(filter);
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL, data: {fills, total} });
  }
}
