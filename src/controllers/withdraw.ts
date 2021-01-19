import {Controller, DEL, GET, POST} from "@src/infrastructure/decorators/koa";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {IRouterContext} from "koa-router";
import WithdrawApplyModel from "@src/models/withdrawApply";
import UserModel from "@src/models/user";
import BillModel from "../models/bill";
import {jsonResponse} from "@src/infrastructure/utils";
import {
  FROZEN_INCOME_TIME,
  RESPONSE_CODE,
  WITHDRAW_APPLY_STATUS,
  WITHDRAW_MIN_AMOUNT
} from "@src/infrastructure/utils/constants";
import {Types} from "mongoose";
import { PaginationDec } from "@src/infrastructure/decorators/pagination";
import { Pagination } from "@src/interface";

@Controller({prefix: "/withdraw"})
export default class Withdraw {
  @POST("")
  @AuthRequired()
  async withdraw (ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const now = Date.now();
    const freezeTime = now - FROZEN_INCOME_TIME;
    // session
    const session = await WithdrawApplyModel.db.startSession({
      defaultTransactionOptions: {
        readConcern: {level: "snapshot"},
        writeConcern: {w: "majority"}
      }
    });
    // 查询可提现收入
    const userFields = {
      broadcaster: 1,
      freezeWithdrawTime: 1,
      withdrawTime: 1
    }
    const user = await UserModel.findOne({uuid}, userFields, {session})
    if (user?.broadcaster) {
      const bills = await BillModel.find({target: uuid, createdAt: {$gt: new Date(user.freezeWithdrawTime), $lte: new Date(freezeTime)}}, {_id: 0, amount: 1}, {session});
      const amount = bills.map(item=>item.amount).reduce((pre, cur)=>pre+cur, 0)
      if (amount >= WITHDRAW_MIN_AMOUNT) {
        await WithdrawApplyModel.create([{uuid, amount, intervalStart: user.freezeWithdrawTime, intervalEnd: now, status: WITHDRAW_APPLY_STATUS.PROCESSING}], {session});
        user.freezeWithdrawTime = now;
        await user.save();
        await session.commitTransaction();
        session.endSession();
        ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
        return
      } else {
        ctx.body = jsonResponse({code: RESPONSE_CODE.ERROR, msg: `remaining income less than $${WITHDRAW_MIN_AMOUNT}`});
      }
    } else {
      ctx.body = jsonResponse({code: RESPONSE_CODE.ERROR, msg: "user is not a broadcaster"});
    }
    if (session.inTransaction()) {
      await session.abortTransaction();
      session.endSession();
    }
  }

  @DEL("/:id")
  @AuthRequired()
  async cancel (ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const id = ctx.params.id;

    const session = await WithdrawApplyModel.db.startSession({
      defaultTransactionOptions: {
        readConcern: {level: "snapshot"},
        writeConcern: {w: "majority"}
      }
    });
    // 查询可提现收入
    const userFields = {
      broadcaster: 1,
      freezeWithdrawTime: 1,
      withdrawTime: 1
    }
    const user = await UserModel.findOne({uuid}, userFields, {session})
    if (user?.broadcaster) {
        await WithdrawApplyModel.update({_id: Types.ObjectId(id)}, {$set: {
          status: WITHDRAW_APPLY_STATUS.CANCELED
        }}, {session});
        user.freezeWithdrawTime = 0;
        await user.save();
        await session.commitTransaction();
        session.endSession();
        ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
    } else {
      ctx.body = jsonResponse({code: RESPONSE_CODE.ERROR, msg: "user is not a broadcaster"});
    }
    if (session.inTransaction()) {
      await session.abortTransaction();
      session.endSession();
    }
  }

  @GET("/records")
  @AuthRequired()
  @PaginationDec()
  async records (ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const status = ctx.query.status;
    const pagination: Pagination = ctx.state.pagination;
    const filter: any = { uuid };
    if (status) {
      filter.status = Number(status as WITHDRAW_APPLY_STATUS);
    }
    const records = await WithdrawApplyModel.find(filter, {
      _id: 1,
      uuid: 1,
      amount: 1,
      status: 1,
      createdAt: 1,
      withdrawId: 1
    }).sort({_id: -1}).skip(pagination.offset).limit(pagination.limit);
    const total = await WithdrawApplyModel.countDocuments(filter);
    ctx.body = jsonResponse({data: {records, total}});
  }
}