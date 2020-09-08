import {Controller, GET, POST} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import commentModel from "../models/comment";
import { jsonResponse } from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import { AuthRequired } from "@src/infrastructure/decorators/auth";
import { PaginationDec } from "@src/infrastructure/decorators/pagination";

@Controller({prefix: "/comment"})
export default class Comment {
  // 查订阅列表
  @GET("/list/:id")
  @AuthRequired()
  @PaginationDec()
  async getCommentList(ctx: IRouterContext, next: any) {
    const postId = ctx.query.id
    const fields = {_id: 0, content: 1, mention: 1, createdAt: 1};
    const pagination = ctx.state.pagination;
    const subscribers = await commentModel.find({postId}, fields).skip(pagination.offset).limit(pagination.limit);
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: subscribers});
  }
}