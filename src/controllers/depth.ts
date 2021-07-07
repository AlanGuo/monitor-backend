import { Controller, GET } from "@src/infrastructure/decorators/koa";
import { IRouterContext } from "koa-router";
import depthModel, { IDepth } from "@src/models/depth";
import { jsonResponse } from "@src/infrastructure/utils";
import { RESPONSE_CODE } from "@src/infrastructure/utils/constants";
import config from "@src/infrastructure/utils/config";

@Controller({ prefix: "/depths" })
export default class depthController {
  @GET("/:symbol")
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
}
