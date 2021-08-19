import { Controller, GET } from "@src/infrastructure/decorators/koa";
import { IRouterContext } from "koa-router";
import depthModel, { IDepth } from "@src/models/depth";
import { jsonResponse } from "@src/infrastructure/utils";
import { RESPONSE_CODE } from "@src/infrastructure/utils/constants";
import config from "@src/infrastructure/utils/config";

@Controller({ prefix: "/depths" })
export default class depthController {
  @GET("/:symbol/avg")
  async getAvgPrice(ctx: IRouterContext) {
    const long_ex = ctx.query.long;
    const short_ex = ctx.query.short;
    const limit = ctx.query.limit;
    const avgPriceDiffRes = await depthModel.aggregate([
      {
        $match: {
          symbol: ctx.params.symbol
        }
      },
      {$limit: limit || config.DEPTH_LIMIT},
      {
        $project:{
          binance_ask: 1, binance_bid: 1, huobi_ask: 1, huobi_bid: 1, okex_ask: 1, okex_bid: 1, 
          close_price_diff: { 
            $subtract: [ `$${short_ex}_ask`, `$${long_ex}_bid` ] 
          },
          open_price_diff: { 
            $subtract: [ `$${short_ex}_bid`, `$${long_ex}_ask` ] 
          }
        }
      },
      {
        $group: {
          _id: null,
          avgClosePriceDiff: {$avg:"$close_price_diff"},
          avgOpenPriceDiff: {$avg:"$open_price_diff"}
        }
      }
    ]);
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL,
      data: {
        avgClosePriceDiff: avgPriceDiffRes.length > 0 ? (avgPriceDiffRes[0].avgClosePriceDiff || 0) : 0,
        avgOpenPriceDiff: avgPriceDiffRes.length > 0 ? (avgPriceDiffRes[0].avgOpenPriceDiff || 0) : 0
      } 
    });
  }

  @GET("/:symbol/pct")
  async getPercentByPriceDiff(ctx: IRouterContext) {
    const long_ex = ctx.query.long;
    const short_ex = ctx.query.short;
    const limit = ctx.query.limit;
    const diff = ctx.query.diff;
    let total = await depthModel.find({symbol: ctx.params.symbol}).limit(limit || config.DEPTH_LIMIT).countDocuments();
    const countRes = await depthModel.aggregate([
      {
        $match: {
          symbol: ctx.params.symbol
        }
      },
      {$limit: limit || config.DEPTH_LIMIT},
      {
        $project:{
          binance_ask: 1, binance_bid: 1, huobi_ask: 1, huobi_bid: 1, okex_ask: 1, okex_bid: 1, 
          close_price_diff: { 
            $subtract: [ `$${short_ex}_ask`, `$${long_ex}_bid` ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          ts:1,
          closePriceLte0: {$lte:["$close_price_diff", Number(diff)]},
        }
      },
      {
        $match: {
          closePriceLte0: true
        }
      },
      {
        $count: "count"
      }
    ]);
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL,
      data: {
        pct: countRes.length > 0 ? (countRes[0].count / total) : 0,
        count: countRes.length > 0 ? countRes[0].count : 0,
        total
      } 
    });
  }

  @GET("/:symbol/diff")
  async getPriceDiffByPct(ctx: IRouterContext) {
    const long_ex = ctx.query.long;
    const short_ex = ctx.query.short;
    const limit = ctx.query.limit || Number.MAX_SAFE_INTEGER;
    const pct = ctx.query.pct;
    let rightTs = 0;
    let total = 0;
    if (limit) {
      const rightRecord = await depthModel.findOne({symbol: ctx.params.symbol}).sort({_id: -1}).skip(Number(limit) - 1);
      total = limit;
      rightTs = rightRecord!.ts;
    } else {
      total = await depthModel.find({symbol: ctx.params.symbol}).countDocuments();
    }
    const targetCount = Number((total * Number(pct)).toFixed(0));
    const countRes = await depthModel.findOne({symbol: ctx.params.symbol, ts: {$gt: rightTs}}).sort({[`${long_ex}_${short_ex}_close_diff`]: 1}).skip(targetCount);

    let hasCloseDiff = false;
    if (countRes && countRes.get(`${long_ex}_${short_ex}_close_diff`)) {
      hasCloseDiff = true
    }
    ctx.body = jsonResponse({ code: hasCloseDiff ? RESPONSE_CODE.NORMAL : RESPONSE_CODE.NOT_FOUND,
      data: {
        diff: hasCloseDiff ? countRes?.get(`${long_ex}_${short_ex}_close_diff`) : null,
        count: targetCount,
        total
      }
    });
  }

  @GET("/:symbol/time")
  async getTimeByDiff(ctx: IRouterContext) {
    const long_ex = ctx.query.long;
    const short_ex = ctx.query.short;
    const diff = ctx.query.diff * 1;

    const countRes = await depthModel.find({
      symbol: ctx.params.symbol,
      [`${long_ex}_${short_ex}_close_diff`]: {
        $lte: diff
      }
    }).sort({
      ts: -1
    }).limit(1);
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL,
      data: {
        ts: countRes.length ? countRes[0].get("ts") : 0,
        timeString: countRes.length ? new Date(countRes[0].get("ts")).toString() : 0,
      }
    });
  }
}
