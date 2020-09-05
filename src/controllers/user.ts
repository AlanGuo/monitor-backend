import {Controller, GET} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import UserModel from "../models/user"
import { jsonResponse } from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import { AuthRequired } from "@src/infrastructure/decorators/auth";
import {getOnlineUser} from "@src/infrastructure/redis";

@Controller({prefix: "/user"})
export default class UserController {

  // 查自己的信息
  @GET("/me")
  @AuthRequired()
  async getMyInfo(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const fields = {_id: 0, uuid: 1, name: 1, displayName: 1, avatar: 1, email: 1};
    const user = await UserModel.findOne({uuid}, fields);
    let rep;
    if (user) {
      rep = user.toJSON();
      const sid = await getOnlineUser(uuid);
      rep.online = !!sid;
    }
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: rep ? rep : user})
  }

  // 查别人的信息
  @GET("/id/:id")
  async getUserById(ctx: IRouterContext, next: any) {
    const fields = {_id: 0, uuid: 1, name: 1, displayName: 1, avatar: 1, email: 1};
    const user = await UserModel.findOne({uuid: ctx.params.id}, fields);
    let rep;
    if (user) {
      rep = user.toJSON();
      const sid = await getOnlineUser(ctx.params.id);
      rep.online = !!sid;
    }
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: rep ? rep : user})
  }

  @GET("/:user?")
  @AuthRequired()
  async getUsers(ctx: IRouterContext, next: any) {
    const nameFilter: {displayName?: RegExp} = {};
    if (ctx.params.user) {
      nameFilter.displayName = new RegExp(ctx.params.user, "i");
    }
    const filterArr: any[] = [nameFilter];

    filterArr.push({uuid: {$ne: ctx.state.user.uuid}});

    const fields = { _id: 0, uuid: 1, name: 1, displayName: 1, avatar: 1, email: 1 };
    const users = await UserModel.find({$and: filterArr}, fields);
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: users})
  }
}
