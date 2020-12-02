import { Controller, GET, POST, DEL } from "@src/infrastructure/decorators/koa";
import { IRouterContext } from "koa-router";
import reportModel from "../models/report";
import { jsonResponse } from "@src/infrastructure/utils";
import { RESPONSE_CODE } from "@src/infrastructure/utils/constants";
import { AuthRequired } from "@src/infrastructure/decorators/auth";
import { Types } from "mongoose";

@Controller({ prefix: "/report" })
export default class Report {

  @POST("/:id")
  @AuthRequired()
  async newReport(ctx: IRouterContext, next: any) {
    const postId = ctx.params.id
    const uuid = ctx.state.user.uuid;
    const body = ctx.request.body;
    await reportModel.create({
      uuid,
      postId: Types.ObjectId(postId),
      reason: body.reason
    });

    ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL });
  }
}