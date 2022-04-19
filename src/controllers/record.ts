import { Controller, GET, PUT } from "@src/infrastructure/decorators/koa";
import { PaginationDec } from "@src/infrastructure/decorators/pagination";
import { Pagination } from "@src/interface";
import { IRouterContext } from "koa-router";
import recordModel, { IRecord } from "@src/models/record";
import fulfillmentModel, { IFulfillment } from "@src/models/fulfillment";
import { jsonResponse } from "@src/infrastructure/utils";
import { RESPONSE_CODE } from "@src/infrastructure/utils/constants";
import config from "@src/infrastructure/utils/config";

@Controller({ prefix: "/records" })
export default class RecordController {

  @GET("/running")
  async getRunningRecord(ctx: IRouterContext) {
    const fields = {
      first_settle_time: 1,
      status: 1,
      next_settle_time: 1,
      symbol: 1,
      longex: 1,
      shortex: 1,
      long_bid_price: 1,
      long_ask_price: 1,
      short_bid_price: 1,
      short_ask_price: 1,
      long_vol_ratio: 1,
      short_vol_ratio: 1,
      long_funding_fee: 1,
      short_funding_fee: 1,
      long_funding_rate:1,
      long_funding_rate_next:1,
      short_funding_rate: 1,
      volume_precision: 1,
      long_price_precision: 1,
      short_price_precision: 1,
      long_price_tick: 1,
      short_price_tick: 1,
      short_funding_rate_next: 1,
      long_open_volume: 1,
      short_open_volume: 1,
      max_volume: 1,
      long_open_balance: 1,
      short_open_balance: 1,
      long_transfer_vec: 1,
      short_transfer_vec: 1,
      long_open_price: 1,
      short_open_price: 1,
      long_final_price: 1,
      short_final_price: 1,
      long_index_price: 1,
      short_index_price: 1,
      best_close_price_diff: 1,
      target_open_price_diff: 1,
      long_balance: 1,
      short_balance: 1,
      profit: 1
    };
    const records = await recordModel.find({profit: { $exists: false }}, fields).sort({ _id: -1 });
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL, data: records });
  }

  @GET("")
  @PaginationDec()
  async getRecords(ctx: IRouterContext) {
    const pagination: Pagination = ctx.state.pagination;
    const fields = {
      _id: 1,
      first_settle_time: 1,
      next_settle_time: 1,
      symbol: 1,
      longex: 1,
      shortex: 1,
      long_funding_fee: 1,
      short_funding_fee: 1,
      long_funding_rate:1,
      short_funding_rate: 1,
      long_open_volume: 1,
      short_open_volume: 1,
      long_final_volume: 1,
      short_final_volume: 1,
      volume_precision: 1,
      long_price_precision: 1,
      short_price_precision: 1,
      long_price_tick: 1,
      short_price_tick: 1,
      max_volume: 1,
      long_open_balance: 1,
      short_open_balance: 1,
      // 兼容旧数据
      long_transfer_transfer: 1,
      short_transfer_transfer: 1,
      long_transfer_vec: 1,
      short_transfer_vec: 1,
      long_open_price: 1,
      short_open_price: 1,
      long_final_price: 1,
      short_final_price: 1,
      long_close_balance: 1,
      short_close_balance: 1,
      usdt_fee: 1,
      bnb_fee: 1,
      profit: 1,
      price_diff_profit: 1,
      "fulfillments.task_id": 1,
      "fulfillments.fee": 1,
      "fulfillments.fee_asset": 1,
      "total_fee": 1
    };
    const records = await recordModel.aggregate([
      {
        $match: {
          long_final_volume: {$gt: 0}
        }
      },
      {$sort: {_id: -1}},
      {$skip: pagination.offset},
      {$limit: pagination.limit},
      {
        $lookup: {
          from: "fulfillments",
          pipeline: [{ $match:{"$fee": {$gt: 0}}}],
          localField: "_id",
          foreignField: "task_id",
          as: "fulfillments"
        }
      },
      {$project: fields}
    ]);
    const total = await recordModel.countDocuments();
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL, data: { records, total } });
  }

  @GET("/stats")
  async statsData(ctx: IRouterContext) {
    const totalProfitRecords = await recordModel.aggregate([
      {
        $group: {
          _id: null,
          totalProfit: { $sum: "$profit" },
        }
      }
    ]);
    const totalBNBFeeRecords = await fulfillmentModel.aggregate([
      {
        $match: {
          fee_asset: "bnb"
        }
      },
      {
        $group: {
          _id: null,
          totalBNBFee: { $sum: "$fee" },
        }
      }
    ]);
    const firstRecord = await recordModel.find({}, {first_settle_time: 1, long_open_balance:1, short_open_balance: 1}).sort({ _id: 1 }).limit(1);
    const lastTime = new Date();
    const firstTime = new Date(firstRecord.length ? firstRecord[0].first_settle_time: Date.now());
    const balance = (firstRecord.length ? firstRecord[0].long_open_balance + firstRecord[0].short_open_balance : 0) + config.FINACIAL.addedBalance;
    let duration = lastTime.getTime() - firstTime.getTime();
    ctx.body = jsonResponse({
      code: RESPONSE_CODE.NORMAL, data:
        {
          balance: balance,
          bnb: config.FINACIAL.bnb,
          bnbPrice: config.FINACIAL.bnbPrice,
          bnbFee: totalBNBFeeRecords.length ? totalBNBFeeRecords[0].totalBNBFee : 0,
          totalProfit: totalProfitRecords.length ? totalProfitRecords[0].totalProfit : 0,
          startTime: firstTime.getTime(),
          days: Math.abs(duration) / 1000 / 3600 / 24
        }
    });
  }
}
