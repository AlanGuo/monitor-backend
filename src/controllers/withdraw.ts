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
    const freezeTime = Date.now() - FROZEN_INCOME_TIME;
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
      incomeAmount: 1,
      freezeWithdrawAmount: 1
    }
    const user = await UserModel.findOne({uuid}, userFields, {session});
    try {
      if (user?.broadcaster) {
        // 账期中的金额
        const bills = await BillModel.find({target: uuid, createdAt: {$gt: new Date(freezeTime)}}, {_id: 0, amount: 1}, {session});
        const freezeAmount = bills.map(item => item.amount).reduce((pre, cur) => pre.plus(cur), new BigNumber(0));
        // 可提现金额
        const amount= new BigNumber(user.incomeAmount).minus(freezeAmount);
        if (amount.isGreaterThanOrEqualTo(WITHDRAW_MIN_AMOUNT)) {
          // 之前的申请
          const beforeProcessingApply = await WithdrawApplyModel.find({
            uuid,
            status: WITHDRAW_APPLY_STATUS.PROCESSING
          }, {_id: 0, amount: 1, intervalStart: 1}, {session});
          const beforeAmount = beforeProcessingApply.map(item => item.amount).reduce((pre,cur)=>new BigNumber(pre).plus(cur), new BigNumber(0));
          await WithdrawApplyModel.update({uuid, status: WITHDRAW_APPLY_STATUS.PROCESSING}, {$set: {status: WITHDRAW_APPLY_STATUS.CANCELED}})
          await WithdrawApplyModel.create([{
            uuid,
            amount: amount.plus(beforeAmount),
            status: WITHDRAW_APPLY_STATUS.PROCESSING
          }], {session});

          user.incomeAmount = amount.minus(user.incomeAmount);
          user.freezeWithdrawAmount = amount.plus(user.freezeWithdrawAmount)
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
      incomeAmount: 1,
      freezeWithdrawAmount: 1
    }
    try {
      const user = await UserModel.findOne({uuid}, userFields, {session})
      if (user?.broadcaster) {
        const apply = await WithdrawApplyModel.findOne({_id: Types.ObjectId(id), status: WITHDRAW_APPLY_STATUS.PROCESSING}, {_id: 1, amount: 1}, {session});
        if (apply) {
          apply.status = WITHDRAW_APPLY_STATUS.CANCELED;
          user.incomeAmount = new BigNumber(user.incomeAmount).plus(apply.amount);
          user.freezeWithdrawAmount = new BigNumber(user.freezeWithdrawAmount).minus(apply.amount);
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
    }catch (e){
      console.error(e)
    }finally {
      if (session.inTransaction()) {
        await session.abortTransaction();
        session.endSession();
      }
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