import { Controller, GET, PUT } from "@src/infrastructure/decorators/koa";
import { PaginationDec } from "@src/infrastructure/decorators/pagination";
import { Pagination } from "@src/interface";
import { IRouterContext } from "koa-router";
import fullfilmentModel, { IFulfillment } from "@src/models/fulfillment";
import { jsonResponse } from "@src/infrastructure/utils";
import { RESPONSE_CODE } from "@src/infrastructure/utils/constants";
import { Types } from "mongoose";

@Controller({ prefix: "/fulfillments" })
export default class fulfillmentController {

  @GET("/task/:id")
  @PaginationDec()
  async getFulfillments(ctx: IRouterContext) {
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
      fill: 1,
      fee: 1
    };
    const filter: any = {
      $expr: { 
        "$and": [{$eq: [ "$task_id" , Types.ObjectId(ctx.params.id) ] }]
      }
    };
    if (query.fulfill && query.fulfill.toLowerCase() == "false") {
      filter.$expr.$and.push({$lt: [ "$fill" , "$volume" ] });
    }
    const fills = await fullfilmentModel.find(filter, fields).sort({ _id: -1 }).skip(pagination.offset).limit(pagination.limit);
    const total = await fullfilmentModel.countDocuments(filter);
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL, data: {fills, total} });
  }

  @GET("/task/fee/:id")
  async getTotalFee(ctx: IRouterContext) {
    const totalFeeRecords = await fullfilmentModel.aggregate([
      {
        $group: {
          _id: Types.ObjectId(ctx.params.id),
          totalFee: { $sum: "$fee" },
        }
      }
    ]);
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL, data: {totalFee: totalFeeRecords[0].totalFee} });
  }
}
