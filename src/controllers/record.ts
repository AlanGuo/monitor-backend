import {Controller, GET, PUT} from "@src/infrastructure/decorators/koa";
import { PaginationDec } from "@src/infrastructure/decorators/pagination";
import { Pagination } from "@src/interface";
import { IRouterContext } from "koa-router";
import recordModel from "@src/models/record";
import { jsonResponse } from "@src/infrastructure/utils";
import { RESPONSE_CODE } from "@src/infrastructure/utils/constants";

@Controller({prefix: "/records"})
export default class RecordController {

  @GET("/running")
  async getRunningRecord(ctx: IRouterContext) {
    const fields = {
      datetime: 1,
      symbol: 1,
      longex: 1,
      shortex: 1,
      long_open_volume: 1,
      short_open_volume: 1,
      max_volume: 1,
      long_open_balance: 1,
      short_open_balance: 1,
      long_open_price: 1,
      short_open_price: 1
    };
    const records = await recordModel.find({profit: {$exists: false}}, fields).sort({_id: -1}).limit(1);
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: records[0]});
  }

  @GET("")
  @PaginationDec()
  async getRecords(ctx: IRouterContext) {
    const pagination: Pagination = ctx.state.pagination
    const fields = {
      datetime: 1,
      symbol: 1,
      longex: 1,
      shortex: 1,
      long_open_volume: 1,
      short_open_volume: 1,
      max_volume: 1,
      long_open_balance: 1,
      short_open_balance: 1,
      long_open_price: 1,
      short_open_price: 1,
      long_close_balance: 1,
      short_close_balance: 1,
      profit: 1
    };
    const records = await recordModel.find({profit: {$exists: true}}, fields).sort({_id: -1}).skip(pagination.offset).limit(pagination.limit);
    const total = await recordModel.countDocuments({});
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: {records, total}});
  }
}
