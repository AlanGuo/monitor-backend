import {Controller, GET} from "@src/infrastructure/decorators/koa";
import KoaRouter, {IRouterContext} from "koa-router";
import UserModel from "../models/user"
import {jsonResponse} from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/responseCode";

@Controller({prefix: "/users"})
export default class UserController {

  @GET("")
  async getUsers(ctx: IRouterContext, next: any) {
    if (ctx.state.user) {
      const fields = {_id: 0, uuid: 1, oauthProfile: 1};
      const users = await UserModel.find({}, fields);
      ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: users})
    } else {
      ctx.body = jsonResponse({code: RESPONSE_CODE.LOGIN_IN_ERR, data: []})
    }
  }
}
