import {Controller, GET} from "@src/infrastructure/decorators/koa";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {IRouterContext} from "koa-router";
import NotificationModel from "@src/models/notification";
import {jsonResponse} from "@src/infrastructure/utils";
import {NotificationStatus, RESPONSE_CODE} from "@src/infrastructure/utils/constants";

@Controller({prefix: "/notification"})
export default class Notification {
  @GET("/unread")
  @AuthRequired()
  async unReadNum(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const unread = await NotificationModel.find({uuid, status: NotificationStatus.unread})
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: unread.length})
  }
}