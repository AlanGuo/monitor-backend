import { Controller, GET, PUT } from "@src/infrastructure/decorators/koa";
import { PaginationDec } from "@src/infrastructure/decorators/pagination";
import { Pagination } from "@src/interface";
import { IRouterContext } from "koa-router";
import fulfillmentModel, { IFulfillment } from "@src/models/fulfillment";
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
    const fills = await fulfillmentModel.find(filter, fields).sort({ _id: -1 }).skip(pagination.offset).limit(pagination.limit);
    const total = await fulfillmentModel.countDocuments(filter);
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL, data: {fills, total} });
  }

  @GET("/task/fee/:id")
  async getTotalFee(ctx: IRouterContext) {
    const query = ctx.query;
    let usdtMatchQueries = {
      $match: {
        task_id: Types.ObjectId(ctx.params.id),
        fee_asset: "usdt"
      }
    } as {
      $match: any
    };
    if (query.exchange) {
      usdtMatchQueries.$match.exchange = query.exchange.toUpperCase();
    }
    let bnbMatchQueries = {
      $match: {
        task_id: Types.ObjectId(ctx.params.id),
        fee_asset: "bnb"
      }
    } as {
      $match: any
    };
    if (query.exchange) {
      bnbMatchQueries.$match.exchange = query.exchange.toUpperCase();
    }
    const totalUsdtFeeRecords = await fulfillmentModel.aggregate([
      usdtMatchQueries,
      {
        $group: {
          _id: null,
          totalFee: { $sum: "$fee" }
        }
      }
    ]);
    const totalBNBFeeRecords = await fulfillmentModel.aggregate([
      bnbMatchQueries,
      {
        $group: {
          _id: null,
          totalFee: { $sum: "$fee" }
        }
      }
    ]);
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL, data: {usdt: totalUsdtFeeRecords[0] ? totalUsdtFeeRecords[0].totalFee : 0, bnb: totalBNBFeeRecords[0] ? totalBNBFeeRecords[0].totalFee : 0} });
  }

  @GET("/task/lost/:id")
  async getTotalLose(ctx: IRouterContext) {
    const fulfillments = await fulfillmentModel.find({
      task_id: Types.ObjectId(ctx.params.id),
    });
    interface IDetailItem {
      unfillOrder: IFulfillment | undefined,
      appendOrders: IFulfillment[],
      lost: number
    }
    let totalLost = 0;
    let detail: IDetailItem[] = [];
    
    for(let index = 0 ;index < fulfillments.length; index +=1) {
      const item = fulfillments[index];
      if (item &&
        // 只统计平仓的损失
        ((item.position === "long" && item.side === "sell") || 
        (item.position === "short" && item.side === "buy"))
      ) {
        const orderTime = new Date(item.datetime);
        const nextItem = fulfillments[index+1];
        if (nextItem) {
          const nextItemOrderTime = new Date(nextItem.datetime);
          if(orderTime.toDateString() == nextItemOrderTime.toDateString() &&
          orderTime.getHours() == nextItemOrderTime.getHours() &&
          orderTime.getMinutes() == nextItemOrderTime.getMinutes() &&
          orderTime.getSeconds() == nextItemOrderTime.getSeconds()) {
            if (item.fill != nextItem.fill) {
              let detailItem: IDetailItem = {
                lost: 0,
                unfillOrder: undefined,
                appendOrders: []
              };
              // 未完全成交
              let findBalanceItemIndex = 2;
              while(fulfillments[index + findBalanceItemIndex]) {
                const balanceItem = fulfillments[index + findBalanceItemIndex];
                if (balanceItem.fill > 0) {
                  // nulfillItem 不会为空，因为这里确定有两边没有同等成交
                  let nulfillItem = null;
                  if (item.fill < nextItem.fill) {
                    nulfillItem = item;
                  } else {
                    nulfillItem = nextItem;
                  }
                  if (nulfillItem) {
                    console.info(nulfillItem.exchange + "的" + nulfillItem.side+"订单" + nulfillItem.order_id + "未完全成交, 挂单价: " + nulfillItem.price + ", 未成交量: " + (nulfillItem.volume - nulfillItem.fill));
                    detailItem.unfillOrder = nulfillItem;
                    if(balanceItem.fill) {
                      detailItem.appendOrders.push(balanceItem);
                      let lost = 0;
                      if (nulfillItem.side === "buy") {
                        lost = (nulfillItem.price - balanceItem.price) * balanceItem.fill;
                      } else if (nulfillItem.side === "sell") {
                        lost = (balanceItem.price - nulfillItem.price) * balanceItem.fill;
                      }
                      detailItem.lost = lost;
                      totalLost += lost;
                      console.info("追加订单" + balanceItem.order_id+", 成交价: " + balanceItem.price + ", 成交量: "+ balanceItem.fill + ", 亏损: " + lost);
                    }
                  }
                }
                // 完全成交，表示两边仓位已拉平
                if(balanceItem.fill == balanceItem.volume) {
                  break;
                }
                findBalanceItemIndex++;
              }
              if (detailItem.unfillOrder) {
                detail.push(detailItem);
              }
            }
          }
        }
      }
    }
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL, data: {totalLost, detail} });
  }

  @GET("/task/close_avg_price/:id")
  async getAvgPrice(ctx: IRouterContext) {
    const totalCloseLongRecords = await fulfillmentModel.aggregate([
      {
        $match: {
          task_id: Types.ObjectId(ctx.params.id),
          side: "sell",
          position: "long"
        }
      },
      {$project:{fill:1, total: { $multiply: [ "$trade_avg_price", "$fill" ] }}},
      {
        $group: {
          _id: null,
          totalFill: {$sum:"$fill"},
          totalPrice:{$sum:"$total"}
        }
      }
    ]);
    const totalCloseShortRecords = await fulfillmentModel.aggregate([
      {
        $match: {
          task_id: Types.ObjectId(ctx.params.id),
          side: "buy",
          position: "short"
        }
      },
      {$project:{fill:1, total: { $multiply: [ "$trade_avg_price", "$fill" ] }}},
      {
        $group: {
          _id: null,
          totalFill: {$sum:"$fill"},
          totalPrice:{$sum:"$total"}
        }
      }
    ]);
    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL,
      data: {
        long_close_price: totalCloseLongRecords.length ? totalCloseLongRecords[0].totalPrice / totalCloseLongRecords[0].totalFill : 0,
        long_closed_volume: totalCloseLongRecords.length ? totalCloseLongRecords[0].totalFill : 0,
        short_close_price: totalCloseShortRecords.length ? totalCloseShortRecords[0].totalPrice / totalCloseShortRecords[0].totalFill : 0,
        short_closed_volume: totalCloseShortRecords.length ? totalCloseShortRecords[0].totalFill : 0,
      } 
    });
  }
}
