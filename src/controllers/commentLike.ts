import {Controller, GET, POST, DEL} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import commentLikeModel from "../models/commentLike";
import commentModel from "@src/models/comment";
import { jsonResponse } from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import { AuthRequired } from "@src/infrastructure/decorators/auth";
import { Types } from "mongoose";

@Controller({prefix: "/commentlike"})
export default class CommentLike {

  @POST("/:id")
  @AuthRequired()
  async newLike(ctx: IRouterContext, next: any) {
    const commentId = ctx.params.id
    const uuid = ctx.state.user.uuid;
    const session = await commentLikeModel.db.startSession();
    session.startTransaction();
    await commentLikeModel.create([{
      commentId: Types.ObjectId(commentId),
      uuid
    }], { session });
    await commentModel.updateOne({
      _id: Types.ObjectId(commentId)
    }, {
      $inc: {
        like: 1
      }
    }, { session });
    await session.commitTransaction();
    session.endSession();
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
  }

  @DEL("/:id")
  @AuthRequired()
  async deleteLike(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const commentId = ctx.params.id
    const session = await commentLikeModel.db.startSession();
    session.startTransaction();
    await commentLikeModel.deleteOne({
      uuid,
      commentId: Types.ObjectId(commentId),
    }, { session });
    await commentModel.updateOne({
      _id: Types.ObjectId(commentId)
    }, {
      $inc: {
        like: -1
      }
    }, { session });
    await session.commitTransaction();
    session.endSession();
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
  }
}