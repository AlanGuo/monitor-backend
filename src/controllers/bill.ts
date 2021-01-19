import {Controller, GET} from "@src/infrastructure/decorators/koa";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {IRouterContext} from "koa-router";
import BillModel from "../models/bill";
import OrderModel from "../models/order";
import TalkPaymentModel from "../models/talkPayment";
import SubscriberPaymentModel from "../models/subscriberPayment";
import MessagePaymentModel from "../models/messagePayment";
import PostPaymentModel from "../models/postPayment";
import TipPaymentModel from "../models/tipPayment";
import {jsonResponse} from "@src/infrastructure/utils";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {Pagination} from "@src/interface";
import {BillType, ConsumeType, RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import {Types} from "mongoose";


@Controller({prefix: "/bill"})
export default class BillController {

  @GET("/list")
  @AuthRequired()
  @PaginationDec()
  async list(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const pagination = ctx.state.pagination as Pagination;
    const fields = {_id: 1, type: 1, amount: 1, consumeType: 1, createdAt: 1, target: 1}
    let match: any = {amount: {$ne: 0}}
    switch (ctx.query.type.toLowerCase()) {
      case BillType.consume:
        match.type = BillType.consume;
        match.uuid = uuid
        break;
      case BillType.deposit:
        match.type = BillType.deposit;
        match.uuid = uuid
        break;
      case BillType.earn:
        match.type = BillType.consume;
        match.target = uuid;
        break;
      default:
        match = {$or: [{target: uuid}, {uuid}], amount: {$ne: 0}};
    }
    const bill = await BillModel.find(match, fields).sort({_id: -1}).skip(pagination.offset).limit(pagination.limit);
    bill.forEach(item => {
      if (item.target === uuid) {
        item.type = BillType.earn
      }
    });
    const total = await BillModel.countDocuments(match);
    ctx.body = jsonResponse({
      code: RESPONSE_CODE.NORMAL,
      data: {bill, total, page: pagination.page, size: pagination.size}
    });
  }

  @GET("/detail/:id")
  @AuthRequired()
  async detail(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const id: string = ctx.params.id
    const fields = {type: 1, amount: 1, consumeType: 1, createdAt: 1, rechargeId: 1, consumeId: 1, target: 1}
    if (!Types.ObjectId.isValid(id)) {
      ctx.body = jsonResponse({code: RESPONSE_CODE.ERROR, msg: "id error"});
      return
    }
    const bill = await BillModel.findOne({_id: Types.ObjectId(id), $or: [{uuid}, {target: uuid}]}, fields);
    let info: any;
    if (bill) {
      switch (bill.type) {
        case BillType.deposit:
          info = {...bill.toJSON(), detail: await OrderModel.findOne({orderId: bill.rechargeId})};
          break;
        case BillType.consume:
          if (bill.target) {
            bill.type = BillType.earn;
          }
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
            case ConsumeType.tip:
              info = {...bill.toJSON(), detail: await TipPaymentModel.findOne({_id: bill.consumeId})}
              break;
          }
      }
      ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: info})
    } else {
      ctx.body = jsonResponse({code: RESPONSE_CODE.ERROR, msg: "the bill does not belong to you"});
    }
  }
}