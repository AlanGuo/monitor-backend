import {Controller, GET} from "@src/infrastructure/decorators/koa";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {IRouterContext} from "koa-router";
import BillModel from "../models/bill";
import OrderModel from "../models/order";
import TalkPaymentModel from "../models/talkPayment";
import SubscriberPaymentModel from "../models/subscriberPayment";
import MessagePaymentModel from "../models/messagePayment";
import PostPaymentModel from "../models/postPayment";
import {jsonResponse} from "@src/infrastructure/utils";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {BillType, ConsumeType, Pagination} from "@src/interface";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import {Types} from "mongoose";


@Controller({prefix: "/bill"})
export default class BillController {

  @GET("/list")
  @AuthRequired()
  @PaginationDec()
  async list(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const pagination = ctx.state.pagination as Pagination;
    const fields = {_id: 1, type: 1, amount: 1, consumeType: 1, createdAt: 1}
    const bill = await BillModel.find({uuid}, fields).sort({_id: -1}).skip(pagination.offset).limit(pagination.limit)
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: bill});
  }

  @GET("/detail/:id")
  @AuthRequired()
  async detail(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const id: string = ctx.params.id
    const fields = {type: 1, amount: 1, consumeType: 1, createdAt: 1, rechargeId: 1, consumeId: 1}
    if (!Types.ObjectId.isValid(id)) {
      ctx.body = jsonResponse({code: RESPONSE_CODE.SHOW_MESSAGE, msg: "id error"});
      return
    }
    const bill = await BillModel.findOne({_id: id, uuid}, fields);
    let info: any;
    if (bill) {
      switch (bill.type) {
        case BillType.deposit:
          info = {...bill, detail: await OrderModel.findOne({orderId: bill.rechargeId})};
          break;
        case BillType.consume:
          switch (bill.consumeType) {
            case ConsumeType.message:
              info = {...bill.toJSON(), detail: await MessagePaymentModel.findOne({_id: bill.consumeId})};
              break;
            case ConsumeType.post:
              info = {...bill.toJSON(), detail: await PostPaymentModel.findOne({_id: bill.consumeId})};
              break;
            case ConsumeType.subscriber:
              info = {...bill.toJSON(), detail: await SubscriberPaymentModel.findOne({_id: bill.consumeId})};
              break;
            case ConsumeType.talk:
              info = {...bill.toJSON(), detail: await TalkPaymentModel.findOne({_id: bill.consumeId})};
              break;
          }
      }
      ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: info})
    } else {
      ctx.body = jsonResponse({code: RESPONSE_CODE.SHOW_MESSAGE, msg: "the bill does not belong to you"});
    }
  }
}