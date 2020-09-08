import {Controller, GET, POST, DEL} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import commentModel from "../models/comment";
import postModel from "@src/models/post";
import { jsonResponse } from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import { AuthRequired } from "@src/infrastructure/decorators/auth";
import { PaginationDec } from "@src/infrastructure/decorators/pagination";
import { Types, connection } from "mongoose";

@Controller({prefix: "/comment"})
export default class Comment {
  // 查订阅列表
  @GET("/list/:id")
  @AuthRequired()
  @PaginationDec()
  async getCommentList(ctx: IRouterContext, next: any) {
    const postId = ctx.query.id
    const uuid = ctx.state.user.uuid;
    const fields = {_id: 1, content: 1, mention: 1, createdAt: 1};
    const pagination = ctx.state.pagination;
    const comments = await commentModel.find({postId, uuid}, fields).skip(pagination.offset).limit(pagination.limit);
    const total = await commentModel.find({postId, uuid}, fields).estimatedDocumentCount();
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: {comments, total}});
  }

  @POST("/:id")
  @AuthRequired()
  async newComment(ctx: IRouterContext, next: any) {
    const postId = ctx.params.id
    const content = ctx.body.content;
    const mention = ctx.body.mention;
    const uuid = ctx.state.user.uuid;
    const session = await commentModel.db.startSession();
    session.startTransaction();
    await commentModel.create([{
      postId,
      uuid,
      content,
      mention,
      deleted: false
    }], {
      session
    });
    await postModel.updateOne({
      _id: Types.ObjectId(postId)
    }, {
      $inc: {
        comment: 1
      }
    }, {
      session
    });
    await session.commitTransaction();
    session.endSession();
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
  }

  @DEL("/:id")
  @AuthRequired()
  async deleteComment(ctx: IRouterContext) {
    const id = ctx.params.id;
    const postId = ctx.query.postid;
    const session = await commentModel.db.startSession();
    session.startTransaction();
    await commentModel.updateOne({
      _id: Types.ObjectId(id)
    }, {
      $set: {
        deleted: true
      }
    });
    await postModel.update({
      _id: Types.ObjectId(postId)
    }, {
      $inc: {
        comment: -1
      }
    }, {
      session
    });
    await session.commitTransaction();
    session.endSession();
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
  }
}