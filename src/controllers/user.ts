import {Controller, GET, PUT} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import UserModel, {IUser} from "../models/user"
import {jsonResponse} from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {getOnlineUser} from "@src/infrastructure/redis";
import {getSignedUrl} from "@src/infrastructure/amazon/cloudfront";
import {userChatPriceProducer} from "@src/services/producer/userChatPriceProducer";

@Controller({prefix: "/user"})
export default class UserController {

  // 查自己的信息
  @GET("/me")
  @AuthRequired()
  async getMyInfo(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const fields = {
      _id: 0,
      uuid: 1,
      name: 1,
      displayName: 1,
      avatar: 1,
      email: 1,
      about: 1,
      website: 1,
      bgImage: 1,
      location: 1,
      chatPrice: 1,
      subPrice: 1,
      balance: 1,
      broardcaster: 1,
      earnBalance: 1,
      freezeEarnBalance: 1,
      totalWithdrawal: 1
    };
    const user = await UserModel.findOne({uuid}, fields);
    let rep: any;
    if (user) {
      rep = user.toJSON();
      if (rep.bgImage) {
        rep.bgImage = getSignedUrl(rep.bgImage);
      }
      if (!/https?/i.test(rep.avatar)) {
        rep.avatar = getSignedUrl(rep.avatar);
      }
      const sid = await getOnlineUser(uuid);
      rep.online = !!sid;
    }
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: rep ? rep : user})
  }

  // 查别人的信息
  @GET("/id/:id")
  async getUserById(ctx: IRouterContext, next: any) {
    const fields = {
      _id: 0,
      uuid: 1,
      name: 1,
      chatPrice: 1,
      subPrice: 1,
      displayName: 1,
      avatar: 1,
      email: 1,
      about: 1,
      website: 1,
      bgImage: 1,
      location: 1,
      broardcaster: 1
    };
    const filter: any = {};
    if (!isNaN(Number(ctx.params.id))) {
      filter.uuid = ctx.params.id;
    } else {
      filter.name = ctx.params.id;
    }
    const user = await UserModel.findOne(filter, fields);
    let rep;
    if (user) {
      rep = user.toJSON();
      if (rep.bgImage) {
        rep.bgImage = getSignedUrl(rep.bgImage);
      }
      if (!/https?/i.test(rep.avatar)) {
        rep.avatar = getSignedUrl(rep.avatar);
      }
      const sid = await getOnlineUser(user.uuid);
      rep.online = !!sid;
    }
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: rep ? rep : user})
  }

  @GET("/:user?")
  @AuthRequired()
  async getUsers(ctx: IRouterContext, next: any) {
    const nameFilter: { $or: any[] } = {$or: []};
    if (ctx.params.user) {
      nameFilter.$or = [
        {displayName: new RegExp(ctx.params.user, "i")},
        {name: new RegExp(ctx.params.user, "i")}
      ]
    }
    const filterArr: any[] = [nameFilter];

    filterArr.push({uuid: {$ne: ctx.state.user.uuid}});

    const fields = {
      _id: 0,
      uuid: 1,
      name: 1,
      displayName: 1,
      avatar: 1,
      email: 1,
      about: 1,
      website: 1,
      bgImage: 1,
      location: 1,
      chatPrice: 1,
      subPrice: 1,
      broardcaster: 1,
    };
    const users = await UserModel.find({$and: filterArr}, fields);
    users.forEach((item) => {
      if (item.avatar && !/https?/i.test(item.avatar)) {
        item.avatar = getSignedUrl(item.avatar);
      }
    });
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: users})
  }

  @PUT("/me")
  @AuthRequired()
  async updateMyInfo(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const body = ctx.request.body;
    // user name cannot be the same
    if (body.name) {
      const user = await UserModel.findOne({
        name: body.name
      });
      if (user) {
        ctx.body = jsonResponse({code: RESPONSE_CODE.USER_NAME_CANNOT_BE_THE_SAME});
        return;
      }
    }
    await UserModel.updateOne({uuid}, body);
    if (body.chatPrice) {
      await userChatPriceProducer.publish(JSON.stringify({uuid, subPrice: body.subPrice}))
    }
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL})
  }
}
