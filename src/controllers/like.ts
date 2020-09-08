import {Controller, GET, POST, DEL} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import likeModel from "../models/like";
import postModel from "@src/models/post";
import { jsonResponse } from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import { AuthRequired } from "@src/infrastructure/decorators/auth";
import { Types } from "mongoose";

@Controller({prefix: "/like"})
export default class Like {

  @POST("/:id")
  //@AuthRequired()
  async newLike(ctx: IRouterContext, next: any) {
    const postId = ctx.params.id
    const uuid = 10000011// ctx.state.user.uuid;
    const session = await likeModel.db.startSession();
    session.startTransaction();
    await likeModel.create([{
      postId,
      uuid
    }], { session });
    await postModel.update({
      _id: Types.ObjectId(postId)
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
    const id = ctx.params.id
    const postId = ctx.query.postid
    const session = await likeModel.db.startSession();
    await likeModel.deleteOne({
      _id: Types.ObjectId(id)
    }, { session });
    await postModel.update({
      _id: Types.ObjectId(postId)
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