import {Controller, GET} from "@src/infrastructure/decorators/koa";
import KoaRouter, {IRouterContext} from "koa-router";
import UserModel from "../models/user"
import { jsonResponse, unauthorized } from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import { AuthRequired } from "@src/infrastructure/decorators/auth";

@Controller({prefix: "/users"})
export default class UserController {

  @GET("/:user?")
  @AuthRequired()
  async getUsers(ctx: IRouterContext, next: any) {
    const nameFilter: {displayName?: RegExp} = {};
    if (ctx.params.user) {
      nameFilter.displayName = new RegExp(ctx.params.user, "i");
    }
    const filterArr: any[] = [nameFilter];
    if (ctx.state.user) {
      filterArr.push({uuid: {$ne: ctx.state.user.uuid}});
    }
    const fields = { _id: 0, uuid: 1, name: 1, displayName: 1, avatar: 1, email: 1 };
    const users = await UserModel.find({$and: filterArr}, fields);
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: users})
  }

  @GET("/id/:id")
  @AuthRequired()
  async getUserById(ctx: IRouterContext, next: any) {
    const fields = {_id: 0, uuid: 1, name: 1, displayName: 1, avatar: 1, email: 1};
    const user = await UserModel.findOne({uuid: ctx.params.id}, fields);
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: user})
  }
}
