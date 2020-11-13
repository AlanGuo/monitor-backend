import {Controller, GET, POST, DEL} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import likeModel from "../models/like";
import postModel from "@src/models/post";
import { jsonResponse } from "@src/infrastructure/utils";
import {NotificationType, RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import { AuthRequired } from "@src/infrastructure/decorators/auth";
import { Types } from "mongoose";
import {notificationProducer} from "@src/services/producer/notificationProducer";

@Controller({prefix: "/like"})
export default class Like {

  @POST("/:id")
  @AuthRequired()
  async newLike(ctx: IRouterContext, next: any) {
    const postId = ctx.params.id
    const uuid = ctx.state.user.uuid;
    const session = await likeModel.db.startSession();
    session.startTransaction();
    await likeModel.create([{
      postId: Types.ObjectId(postId),
      uuid
    }], { session });
    await postModel.updateOne({
      _id: Types.ObjectId(postId)
    }, {
      $inc: {
        like: 1
      }
    }, { session });
    await session.commitTransaction();
    session.endSession();

    const msg = {type: NotificationType.postLike, postId, uuid};
    await notificationProducer.publish(JSON.stringify(msg))

    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
  }

  @DEL("/:id")
  @AuthRequired()
  async deleteLike(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const postId = ctx.params.id
    const session = await likeModel.db.startSession();
    session.startTransaction();
    await likeModel.deleteOne({
      uuid,
      postId: Types.ObjectId(postId)
    }, { session });
    await postModel.updateOne({
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