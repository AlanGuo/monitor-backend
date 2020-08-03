import { Controller, POST } from "@src/infrastructure/decorators/koa";
import { IRouterContext } from "koa-router";

@Controller({ prefix: "/callback" })
export default class CallbackController {
  @POST("/mediaconvertcomplete/notification")
  async notify(ctx: IRouterContext) {
    const req = ctx.request;
    console.log(req);
    ctx.body = req;
  }
}