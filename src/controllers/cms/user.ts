import {Controller, POST} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import UserModel from "../../models/user"
import RecommendUserModel from "../../models/recommendUser"
import {jsonResponse} from "@src/infrastructure/utils";

// move to new project
@Controller({prefix: "/cms/user"})
export default class UserController {

  @POST("/recommend")
  async new(ctx: IRouterContext, next: any) {
    let {startTime, endTime} = ctx.request.body;
    const {uuid} = ctx.request.body;
    const now = new Date()
    endTime = endTime ? new Date(endTime) > now ? new Date(endTime) : now : now;
    startTime = startTime ? new Date(startTime) > endTime
      ? new Date(endTime.getTime() - 1000 * 60 * 60 * 24)
      : new Date(now.getTime() - 1000 * 60 * 60 * 24)
      : new Date(now.getTime() - 1000 * 60 * 60 * 24);
    if (uuid) {
      if (await UserModel.exists({uuid})) {
        await RecommendUserModel.findOneAndUpdate({uuid}, {
          $setOnInsert: {
            uuid,
            startTime,
            endTime,
            sort: 1
          },
          $set: {}
        }, {new: true, upsert: true})
      }
    }
    ctx.body = jsonResponse()
  }
}
