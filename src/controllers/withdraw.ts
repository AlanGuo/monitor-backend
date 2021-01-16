import {Controller, POST} from "@src/infrastructure/decorators/koa";
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
      if (amount > WITHDRAW_MIN_AMOUNT) {
        await WithdrawApplyModel.create([{uuid, amount, intervalStart: user.freezeWithdrawTime, intervalEnd: now, status: WITHDRAW_APPLY_STATUS.Processing}], {session});
        user.freezeWithdrawTime = now;
        await user.save();
        await session.commitTransaction();
        session.endSession();
        ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
        return
      } else {
        ctx.body = jsonResponse({code: RESPONSE_CODE.SHOW_MESSAGE, msg: `remaining income less than $${WITHDRAW_MIN_AMOUNT}`});
      }
    } else {
      ctx.body = jsonResponse({code: RESPONSE_CODE.SHOW_MESSAGE, msg: "user is not a broadcaster"});
    }
    if (session.inTransaction()) {
      await session.abortTransaction();
      session.endSession();
    }
  }
}