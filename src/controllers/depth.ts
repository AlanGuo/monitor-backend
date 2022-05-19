import { Controller, GET } from "@src/infrastructure/decorators/koa";
import { IRouterContext } from "koa-router";
import depthModel, { IDepth } from "@src/models/depth";
import { jsonResponse } from "@src/infrastructure/utils";
import { RESPONSE_CODE } from "@src/infrastructure/utils/constants";
import config from "@src/infrastructure/utils/config";
import fundingRateModel from "@src/models/fundingrate";
import ts from "typescript";

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
          binance_ask: 1, binance_bid: 1, bybit_ask: 1, bybit_bid: 1, okex_ask: 1, okex_bid: 1, 
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
    let total = await depthModel.find({symbol: ctx.params.symbol}).limit(Number(limit) || config.DEPTH_LIMIT).countDocuments();
    const countRes = await depthModel.aggregate([
      {
        $match: {
          symbol: ctx.params.symbol
        }
      },
      {$limit: Number(limit) || config.DEPTH_LIMIT},
      {
        $project:{
          binance_ask: 1, binance_bid: 1, bybit_ask: 1, bybit_bid: 1, okex_ask: 1, okex_bid: 1, 
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
    const limit = ctx.query.limit;
    const pct = ctx.query.pct;
    let rightTs = 0;
    let total = 0;
    if (limit) {
      const rightRecord = await depthModel.findOne({symbol: ctx.params.symbol}).sort({_id: -1}).skip(Number(limit) - 1);
      total = Number(limit);
      rightTs = rightRecord!.ts;
    } else {
      total = await depthModel.find({symbol: ctx.params.symbol}).countDocuments();
    }
    const targetCount = Number((total * Number(pct)).toFixed(0));
    const countRes = await depthModel.findOne({symbol: ctx.params.symbol, ts: {$gt: rightTs}}).sort({[`${long_ex}_${short_ex}_close_diff`]: 1}).skip(targetCount);

    let hasCloseDiff = false;
    if (countRes && countRes.get(`${long_ex}_${short_ex}_close_diff`) != null) {
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

  @GET("/:symbol/fluctuation")
  async getFluctuationRate(ctx: IRouterContext) {
    // hour as unit
    let period = 0;
    if (ctx.query.period) {
      period = Number(ctx.query.period);
    }
    // minute as unit
    const duration = Number(ctx.query.duration);
    const now = new Date().getTime();
    if (isNaN(duration) || isNaN(period)) {
      ctx.body = jsonResponse({ 
        code: RESPONSE_CODE.ERROR,
        msg: "duration and period must be number"
      });
    } else {
      let filter = { symbol: ctx.params.symbol } as any;
      if (period) {
        filter.ts = {$gt: now - period * 3600 * 1000};
      }
      const depthRes = await depthModel.find(filter);
      // binance
      let binanceAllTimes = 0;
      let binanceAskUnfillTimes = 0;
      let binanceBidUnfillTimes = 0;
      let binanceBidTotalLoss = 0;
      let binanceAskTotalLoss = 0;
      // bybit
      let bybitAllTimes = 0;
      let bybitAskUnfillTimes = 0;
      let bybitBidUnfillTimes = 0;
      let bybitBidTotalLoss = 0;
      let bybitAskTotalLoss = 0;
      // okx
      let okxAllTimes= 0;
      let okxAskUnfillTimes = 0;
      let okxBidUnfillTimes = 0;
      let okxBidTotalLoss = 0;
      let okxAskTotalLoss = 0;
      for(let i=0;i<depthRes.length;i++) {
        const item = depthRes[i];
        let binanceBidFinished = false;
        let binanceAskFinished = false;
        let bybitBidFinished = false;
        let bybitAskFinished = false;
        let okxBidFinished = false;
        let okxAskFinished = false;
        
        if (item.binance_ask) {
          binanceAllTimes ++;
        }
        if (item.bybit_ask) {
          bybitAllTimes ++;
        }
        if (item.okex_ask) {
          okxAllTimes ++;
        }
        for(let j=i+1;j<depthRes.length;j++) {
          const compareItem = depthRes[j];
          // 一定周期内
          if (compareItem.ts - item.ts > duration * 60 * 1000) {
            // binance
            if (compareItem.binance_ask && item.binance_bid && !binanceBidFinished) {
              binanceBidUnfillTimes ++;
              binanceBidTotalLoss += (compareItem.binance_ask - item.binance_bid) / item.binance_bid;
            }
            if (compareItem.binance_ask && item.binance_bid && !binanceAskFinished) {
              binanceAskUnfillTimes ++;
              binanceAskTotalLoss += (item.binance_ask - compareItem.binance_bid) / item.binance_ask;
            }
            // bybit
            if (compareItem.bybit_ask && item.bybit_bid && !bybitBidFinished) {
              bybitBidUnfillTimes ++;
              bybitBidTotalLoss += (compareItem.bybit_ask - item.bybit_bid) / item.bybit_bid;
            }
            if (compareItem.bybit_ask && item.bybit_ask && !bybitAskFinished) {
              bybitAskUnfillTimes ++;
              bybitAskTotalLoss += (item.bybit_ask - compareItem.bybit_bid) / item.bybit_ask;
            }
            // okx
            if (compareItem.okex_ask && item.okex_bid && !okxBidFinished) {
              okxBidUnfillTimes ++;
              okxBidTotalLoss += (compareItem.okex_ask - item.okex_bid) / item.okex_bid;
            }
            if (compareItem.okex_ask && item.okex_ask && !okxAskFinished) {
              okxAskUnfillTimes ++;
              okxAskTotalLoss += (item.okex_ask - compareItem.okex_bid) / item.okex_ask;
            }
            break;
          } else {
            // binance
            if (compareItem.binance_ask && !binanceBidFinished && compareItem.binance_ask <= item.binance_bid) {
              binanceBidFinished = true;
            }
            if (compareItem.binance_ask && !binanceAskFinished && compareItem.binance_bid >= item.binance_ask) {
              binanceAskFinished = true;
            }
            // bybit
            if (compareItem.bybit_ask && !bybitBidFinished && compareItem.bybit_ask <= item.bybit_bid) {
              bybitBidFinished = true;
            }
            if (compareItem.bybit_ask && !bybitAskFinished && compareItem.bybit_bid >= item.bybit_ask) {
              bybitAskFinished = true;
            }
            // okx
            if (compareItem.okex_ask && !okxBidFinished && compareItem.okex_ask <= item.okex_bid) {
              okxBidFinished = true;
            }
            if (compareItem.okex_ask && !okxAskFinished && compareItem.okex_bid >= item.okex_ask) {
              okxAskFinished = true;
            }
          }
        }
      }
      const binanceAskAvgLoss =  binanceAskUnfillTimes > 0 ? binanceAskTotalLoss / binanceAskUnfillTimes : 0;
      const binanceBidAvgLoss = binanceBidUnfillTimes > 0 ? binanceBidTotalLoss / binanceBidUnfillTimes : 0;
      const binanceAskLoss = binanceAllTimes > 0 ? binanceAskAvgLoss * binanceAskUnfillTimes / binanceAllTimes : 0;
      const binanceBidLoss = binanceAllTimes > 0 ? binanceBidAvgLoss * binanceBidUnfillTimes / binanceAllTimes : 0;

      const bybitAskAvgLoss =  bybitAskUnfillTimes > 0 ? bybitAskTotalLoss / bybitAskUnfillTimes : 0;
      const bybitBidAvgLoss = bybitBidUnfillTimes > 0 ? bybitBidTotalLoss / bybitBidUnfillTimes : 0;
      const bybitAskLoss = bybitAllTimes > 0 ? bybitAskAvgLoss * bybitAskUnfillTimes / bybitAllTimes : 0;
      const bybitBidLoss = bybitAllTimes > 0 ? bybitBidAvgLoss * bybitBidUnfillTimes / bybitAllTimes : 0;

      const okxAskAvgLoss =  okxAskUnfillTimes > 0 ? okxAskTotalLoss / okxAskUnfillTimes : 0;
      const okxBidAvgLoss = okxBidUnfillTimes > 0 ? okxBidTotalLoss / okxBidUnfillTimes : 0;
      const okxAskLoss = okxAllTimes > 0 ? okxAskAvgLoss * okxAskUnfillTimes / okxAllTimes : 0;
      const okxBidLoss = okxAllTimes > 0 ? okxBidAvgLoss * okxBidUnfillTimes / okxAllTimes : 0;
      ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL,
        data: {
          binanceAllTimes,
          binanceAskUnfillTimes,
          binanceBidUnfillTimes,
          binanceAskAvgLoss,
          binanceBidAvgLoss,
          binanceAskLoss,
          binanceBidLoss,
          // bybit
          bybitAllTimes,
          bybitAskUnfillTimes,
          bybitBidUnfillTimes,
          bybitAskAvgLoss: bybitAskUnfillTimes > 0 ? bybitAskTotalLoss / bybitAskUnfillTimes : 0,
          bybitBidAvgLoss: bybitBidUnfillTimes > 0 ? bybitBidTotalLoss / bybitBidUnfillTimes : 0, 
          bybitAskLoss,
          bybitBidLoss,
          // okx
          okxAllTimes,
          okxAskUnfillTimes,
          okxBidUnfillTimes,
          okxAskAvgLoss: okxAskUnfillTimes > 0 ? okxAskTotalLoss / okxAskUnfillTimes : 0,
          okxBidAvgLoss: okxBidUnfillTimes > 0 ? okxBidTotalLoss / okxBidUnfillTimes : 0,
          okxAskLoss,
          okxBidLoss
        }
      });
    }
  }

  @GET("/:symbol/fr2")
  async getFr2(ctx: IRouterContext) {
    // 判断最近一周，交割时间点开单进去，然后原价平仓出掉赚取资金费率的可能性
    // 仓位最多拿多久
    const duration = Number(ctx.query.duration);
    // 提前多少分钟开单
    const ahead = Number(ctx.query.ahead);
    // 交易所
    const ex = ctx.query.exchange;
    const currency = ctx.query.currency || "usdt";
    // 结算时间点
    const settleTimePoint = ctx.query.settle;
    const settlePointsArr = settleTimePoint.split(",")
    // 默认7天，单位是小时
    let period = 168;
    if (ctx.query.period) {
      period = Number(ctx.query.period);
    }
    const now = new Date().getTime();
    const pointsArr: number[] = [];
    let from  =  now - period * 3600 * 1000;
    while(from < now) {
      settlePointsArr.forEach((element: string) => {
        const timePoint = new Date(from);
        timePoint.setHours(Number(element));
        timePoint.setMinutes(0);
        timePoint.setSeconds(0);
        timePoint.setMilliseconds(0);
        pointsArr.push(timePoint.getTime());
      });
      // + 24h
      from += 24 * 3600 * 1000;
    }
    const filter = { 
      symbol: ctx.params.symbol,
      currency,
      exchange: ex.toUpperCase(),
      ts: {$in: pointsArr}
    };
    console.log(filter);
    const fundingRateRes = await fundingRateModel.find();
    console.log("fundingRateRes: ", fundingRateRes);
    for(const timeItem of pointsArr) {
      const fundingRateItem = fundingRateRes.find(item => {
        return item.ts === timeItem
      });
      console.log("fundingRateItem: ", fundingRateItem);
      const depthFrom = timeItem - ahead * 60 * 1000;
      const filter = { symbol: ctx.params.symbol,  ts: {$gt: depthFrom} };
      const depthRes = await depthModel.find(filter);
      let longTotalTimes = 0;
      let longUnfillTimes = 0;
      let longTotalLoss = 0;
      let shortTotalTimes = 0;
      let shortUnfillTimes = 0;
      let shortTotalLoss = 0;
      const shortDetails = [] as any[];
      const longDetails = [] as any[];
      for(let i=0;i<depthRes.length;i++) {
        const item = depthRes[i];
        let shortFinished = false;
        let longFinished = false;
        let exMap = ex;
        if (exMap === "okx") {
          exMap = "okex";
        }
        const askField = exMap + "_ask";
        const bidField = exMap + "_bid";
        if (item.get(askField)) {
          longTotalTimes ++;
        }
        if (item.get(bidField)) {
          shortTotalTimes ++;
        }
        for(let j=i+1;j<depthRes.length;j++) {
          const compareItem = depthRes[j];
          // 一定周期内
          if (compareItem.ts - item.ts > duration * 60 * 1000) {
            if (compareItem.get(askField) && item.get(bidField)) {
              if (shortFinished) {
                shortDetails.push({
                  fundingRate: fundingRateItem,
                  in: item,
                  op: "short",
                  out: compareItem,
                  status: "success"
                });
              } else {
                shortUnfillTimes ++;
                const loss = (compareItem.get(askField) - item.get(bidField)) / item.get(bidField);
                shortTotalLoss += loss;
                shortDetails.push({
                  fundingRate: fundingRateItem,
                  in: item,
                  op: "short",
                  out: compareItem,
                  loss,
                  status: "failure"
                });
              }
            }
            if (compareItem.get(askField) && item.get(bidField)) {
              if (longFinished) {
                longDetails.push({
                  fundingRate: fundingRateItem,
                  in: item,
                  op: "long",
                  out: compareItem,
                  status: "success"
                });
              } else {
                longUnfillTimes ++;
                const loss = (item.get(askField) - compareItem.get(bidField)) / item.get(askField);
                longTotalLoss += loss;
                longDetails.push({
                  fundingRate: fundingRateItem,
                  ts: ts,
                  in: item,
                  op: "long",
                  out: compareItem,
                  loss,
                  status: "failure"
                });
              }
            }
            break;
          } else {
            // sell short
            if (compareItem.get(askField) && !shortFinished && compareItem.get(askField) <= item.get(bidField)) {
              shortFinished = true;
            }
            // buy long
            if (compareItem.get(askField) && !longFinished && compareItem.get(bidField) >= item.get(askField)) {
              longFinished = true;
            }
          }
        }
      }

      ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL, data: {
        longTotalTimes,
        longUnfillTimes,
        longTotalLoss,
        shortTotalTimes,
        shortUnfillTimes,
        shortTotalLoss,
        longDetails,
        shortDetails
      }});
    }
  }
}
