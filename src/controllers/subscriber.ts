import {Controller, GET, POST} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import SubscriberModel from "../models/subscriber"
import { jsonResponse } from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import { AuthRequired } from "@src/infrastructure/decorators/auth";
import { PaginationDec } from "@src/infrastructure/decorators/pagination";

@Controller({prefix: "/subscriber"})
export default class Subscriber {
  // 查订阅列表
  @GET("/my/list")
  @AuthRequired()
  @PaginationDec()
  async getSubcriberList(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const fields = {_id: 0, subscriber: 1};
    const pagination = ctx.state.pagination;
    const subscribers = await SubscriberModel.find({uuid}, fields).skip(pagination.offset).limit(pagination.limit);
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: subscribers});
  }

  // 查订阅总数
  @GET("/my/total")
  @AuthRequired()
  async getSubcribers(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const following = await SubscriberModel.find({uuid}).countDocuments();
    const fans = await SubscriberModel.find({target: uuid}).countDocuments();
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: {following, fans}});
  }

  @POST("/new/:target")
  @AuthRequired()
  async subNewUser(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const target = Number(ctx.params.target);
    if (target === uuid) {
      ctx.body = jsonResponse({code: RESPONSE_CODE.CAN_NOT_SUBSCRIBE_YOURSELF});
    } else {
      await SubscriberModel.create({
        uuid,
        target
      });
      ctx.body = jsonResponse({ code: RESPONSE_CODE.NORMAL });
    }
  }
}