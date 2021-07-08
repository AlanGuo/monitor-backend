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
    let total = await depthModel.find({symbol: ctx.params.symbol}).limit(limit || config.DEPTH_LIMIT).count();
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
          },
          open_price_diff: { 
            $subtract: [ `$${short_ex}_bid`, `$${long_ex}_ask` ] 
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
    const limit = ctx.query.limit || config.DEPTH_LIMIT;
    const pct = ctx.query.pct;
    const step = ctx.query.step;
    const total = await depthModel.find({symbol: ctx.params.symbol}).limit(limit).countDocuments();
    const targetCount = total * Number(pct);
    const getCountByDiff = async function(diff: number) {
      const countRes = await depthModel.aggregate([
        {
          $match: {
            symbol: ctx.params.symbol
          }
        },
        {$limit: limit},
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
          $project: {
            _id: 0,
            ts:1,
            closePriceLte0: {$lte:["$close_price_diff", diff]},
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
  
      return countRes.length > 0 ? countRes[0].count : 0;
    }

    if (step <= 0) {
      ctx.body = jsonResponse({ code: RESPONSE_CODE.ERROR, msg: "step must be greater than 0"});
    } else {
      let finalDiff = 0;
      let countx = await getCountByDiff(finalDiff);
      console.log("targetCount: " + targetCount + ", countx: " + countx);
      if (countx >= targetCount) {
        // diff 每次减少一个 step，直到下一个 count < targetCount
        do {
          finalDiff = finalDiff - Number(step);
          countx = await getCountByDiff(finalDiff);
        } while(countx >= targetCount);
        // diff = 上一个满足条件的 diff
        finalDiff = finalDiff + Number(step);
      } else {
        // diff 每次增加一个 step，直到下一个 count >= targetCount
        do {
          finalDiff = finalDiff + Number(step);
          countx = await getCountByDiff(finalDiff);
        } while(countx < targetCount);
      }
      ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL,
        data: {
          diff: finalDiff,
          count: countx,
          total
        } 
      });
    }
  }
}
