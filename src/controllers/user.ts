import {Controller, GET} from "@src/infrastructure/decorators/koa";
import KoaRouter, {IRouterContext} from "koa-router";
import UserModel from "../models/user"
import { jsonResponse, unauthorized } from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import { AuthRequired } from "@src/infrastructure/decorators/auth";

@Controller({prefix: "/users"})
export default class UserController {

  @GET()
  @AuthRequired()
  async getUsers(ctx: IRouterContext, next: any) {
    const fields = {_id: 0, uuid: 1, displayName: 1, avatar: 1, email: 1};
    const users = await UserModel.find({}, fields);
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: users})
  }
}
