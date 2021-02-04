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
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {Pagination} from "@src/interface";
import BigNumber from "bignumber.js";

@Controller({prefix: "/withdraw"})
export default class Withdraw {
  @POST("")
  @AuthRequired()
  async withdraw(ctx: IRouterContext) {
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
    session.startTransaction();

    // 查询可提现收入
    const userFields = {
      broadcaster: 1,
      freezeWithdrawTime: 1,
      withdrawTime: 1,
      incomeAmount: 1,
      freezeWithdrawAmount: 1
    }
    const user = await UserModel.findOne({uuid}, userFields, {session});
    try {
      if (user?.broadcaster) {
        const bills = await BillModel.find({
          target: uuid,
          createdAt: {$gt: new Date(user.freezeWithdrawTime), $lte: new Date(freezeTime)}
        }, {_id: 0, amount: 1}, {session});
        const amount = bills.map(item => item.amount).reduce((pre, cur) => pre.plus(cur), new BigNumber(0))
        if (amount.isGreaterThanOrEqualTo(WITHDRAW_MIN_AMOUNT)) {
          const beforeProcessingApply = await WithdrawApplyModel.find({
            uuid,
            status: WITHDRAW_APPLY_STATUS.PROCESSING
          }, {_id: 0, amount: 1, intervalStart: 1}, {session});
          let beforeAmount = 0;
          let beforeIntervalStart = 0;
          if (beforeProcessingApply.length > 0) {
            // cancel beforeApply
            beforeAmount = beforeProcessingApply.map(item => {
              beforeIntervalStart = beforeIntervalStart === 0 ? item.intervalStart : item.intervalStart < beforeIntervalStart ? item.intervalStart : beforeIntervalStart
              return item.amount;
            }).reduce((pre, cur) => pre + cur, 0);
            await WithdrawApplyModel.update({uuid, status: WITHDRAW_APPLY_STATUS.PROCESSING}, {$set: {status: WITHDRAW_APPLY_STATUS.CANCELED}})
          }
          await WithdrawApplyModel.create([{
            uuid,
            amount: amount.plus(beforeAmount).toNumber(),
            intervalStart: beforeIntervalStart === 0 ? user.freezeWithdrawTime : beforeIntervalStart,
            intervalEnd: now,
            status: WITHDRAW_APPLY_STATUS.PROCESSING
          }], {session});
          user.freezeWithdrawTime = freezeTime;
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
    } catch (e) {
      console.error(e)
    } finally {
      if (session.inTransaction()) {
        await session.abortTransaction();
        session.endSession();
      }
    }
  }

  @DEL("/:id")
  @AuthRequired()
  async cancel(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const id = ctx.params.id;

    const session = await WithdrawApplyModel.db.startSession({
      defaultTransactionOptions: {
        readConcern: {level: "snapshot"},
        writeConcern: {w: "majority"}
      }
    });
    session.startTransaction();

    // 查询可提现收入
    const userFields = {
      broadcaster: 1,
      freezeWithdrawTime: 1,
      withdrawTime: 1
    }
    const user = await UserModel.findOne({uuid}, userFields, {session})
    if (user?.broadcaster) {
      const apply = await WithdrawApplyModel.findOne({_id: Types.ObjectId(id), status: WITHDRAW_APPLY_STATUS.PROCESSING}, {_id: 1, intervalStart: 1}, {session});
      if (apply) {
        apply.status = WITHDRAW_APPLY_STATUS.CANCELED;
        user.freezeWithdrawTime = apply.intervalStart;
        await apply.save()
        await user.save();
        await session.commitTransaction();
        session.endSession();
        ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
      } else {
        ctx.body = jsonResponse({code: RESPONSE_CODE.ERROR, msg: "apply is not exists or can't cancel"});
      }
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
  async records(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const status = ctx.query.status;
    const pagination: Pagination = ctx.state.pagination;
    const filter: any = {uuid};
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