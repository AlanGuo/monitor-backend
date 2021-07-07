import { Controller, GET } from "@src/infrastructure/decorators/koa";
import { IRouterContext } from "koa-router";
import depthModel, { IDepth } from "@src/models/depth";
import { jsonResponse } from "@src/infrastructure/utils";
import { RESPONSE_CODE } from "@src/infrastructure/utils/constants";
import { Types } from "mongoose";

@Controller({ prefix: "/depths" })
export default class depthController {
  @GET("/:symbol")
  async getAvgPrice(ctx: IRouterContext) {
    const long_ex = ctx.query.long;
    const short_ex = ctx.query.short;
    const avgClosePriceDiffRes = await depthModel.aggregate([
      {
        $match: {
          symbol: ctx.params.symbol
        }
      },
      {$project:{binance_ask: 1, binance_bid: 1, huobi_ask: 1, huobi_bid: 1, okex_ask: 1, okex_bid: 1, close_price_diff: { $subtract: [ `$${short_ex}_ask`, `$${long_ex}_bid` ] }}},
      {
        $group: {
          _id: null,
          avgClosePriceDiff: {$avg:"$close_price_diff"}
        }
      }
    ]);
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL,
      data: {
        avgClosePriceDiff: avgClosePriceDiffRes.length > 0 ? avgClosePriceDiffRes[0].avgClosePriceDiff : 0
      } 
    });
  }
}
