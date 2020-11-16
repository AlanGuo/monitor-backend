import {Controller, POST} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {jsonResponse} from "@src/infrastructure/utils";
import {BillType, ConsumeType, RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import PostModel, {Post} from "@src/models/post";
import UserModel from "@src/models/user";
import TipPaymentModel from "@src/models/tipPayment";
import BillModel from "@src/models/bill";

@Controller({prefix: "/tip"})
export default class TipController {
  @POST("")
  @AuthRequired()
  async tip(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const amount = ctx.request.body.amount;
    const postId = ctx.request.body.postId;
    let target = ctx.request.body.targetUser;
    if (!amount) {
      ctx.body = jsonResponse({code: RESPONSE_CODE.SHOW_MESSAGE, msg: "must fill amount"});
      return
    }
    if (!target && !postId) {
      ctx.body = jsonResponse({code: RESPONSE_CODE.SHOW_MESSAGE, msg: "must select the user or POST"});
      return
    }
    const session = await TipPaymentModel.db.startSession({
      defaultTransactionOptions: {
        readConcern: {level: "snapshot"},
        writeConcern: {w: "majority"}
      }
    });
    session.startTransaction();

    if (postId) {
      const post = await PostModel.findOne({_id: postId}, {from: 1}, {session});
      if (post && !target) {
        target = post.from
      }
    }
    if (target === uuid) {
      ctx.body = jsonResponse({code: RESPONSE_CODE.SHOW_MESSAGE, msg: "You can't tip yourself"});
    } else {
      const user = await UserModel.findOne({uuid}, {balance: 1, uuid: 1}, {session});
      if (user && user.balance > amount) {
        user.balance -= amount
        await user.save();
        const [payment] = await TipPaymentModel.create([{uuid, target, amount, postId}], {session});
        await BillModel.create([{
          uuid,
          type: BillType.consume,
          amount,
          consumeType: ConsumeType.tip,
          consumeId: payment._id
        }], {session});
        await session.commitTransaction();
        session.endSession();
        ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
        return
      }
      ctx.body = jsonResponse({code: RESPONSE_CODE.BALANCE_NOT_ENOUGH});
    }

    if (session.inTransaction()) {
      await session.abortTransaction();
      session.endSession();
    }
  }
}