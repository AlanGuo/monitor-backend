import {Controller, GET, PUT} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import UserModel from "../models/user";
import BillModel from "../models/bill";
import SubscriberModel from "../models/subscriber";
import {jsonResponse} from "@src/infrastructure/utils";
import {FROZEN_INCOME_TIME, NotificationType, RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {getOnlineUser} from "@src/infrastructure/redis";
import {getSignedUrl} from "@src/infrastructure/amazon/cloudfront";
import {notificationProducer} from "@src/services/producer/notificationProducer";
import { createUserWatermarker } from "@src/infrastructure/utils/watermarker";
import {CheckChatPrice} from "@src/infrastructure/decorators/checkChatPrice";
import {CheckSubPrice} from "@src/infrastructure/decorators/checkSubPrice";
import BigNumber from "bignumber.js";

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
      broadcaster: 1,
      freezeWithdrawTime: 1,
      withdrawTime: 1
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

      if (user.broadcaster) {
        const now = Date.now();
        const freezeTime = now - FROZEN_INCOME_TIME;
        const bill = await BillModel.find({target: uuid}, {_id: 0, amount: 1, createdAt: 1});
        rep.income = {total: new BigNumber(0), balance: new BigNumber(0), freezeBalance: new BigNumber(0), withdraw: new BigNumber(0), freezeWithdraw: new BigNumber(0)};
        bill.forEach(item => {
          const time = new Date(item.createdAt!).getTime();
          rep.income.total = rep.income.total.plus(item.amount);
          if (time > freezeTime) {
            rep.income.freezeBalance = rep.income.freezeBalance.plus(item.amount);
          }
          if (time > user.withdrawTime && time <= user.freezeWithdrawTime) {
            rep.income.freezeWithdraw = rep.income.freezeWithdraw.plus(item.amount);
          }
          if (time <= user.withdrawTime) {
            rep.income.withdraw = rep.income.withdraw.plus(item.amount);
          }
        })
        rep.income.balance = rep.income.total - rep.income.withdraw - rep.income.freezeWithdraw - rep.income.freezeBalance;
      }
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
      broadcaster: 1
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
      const uuid = Number(ctx.params.user);
      nameFilter.$or = [
        {uuid: isNaN(uuid) ? 0 : uuid},
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
      broadcaster: 1,
    };
    const users = await UserModel.find({$and: filterArr}, fields).limit(10);
    users.forEach((item) => {
      if (item.avatar && !/https?/i.test(item.avatar)) {
        item.avatar = getSignedUrl(item.avatar);
      }
    });
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: users})
  }

  @PUT("/me")
  @AuthRequired()
  @CheckChatPrice()
  @CheckSubPrice()
  async updateMyInfo(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const body = ctx.request.body;
    // user name cannot be the same
    if (body.name) {
      if (await UserModel.exists({name: body.name})) {
        ctx.body = jsonResponse({code: RESPONSE_CODE.USER_NAME_CANNOT_BE_THE_SAME});
        return;
      }
    }
    const user = await UserModel.findOne({uuid}, {uuid: 1, name: 1, subPrice: 1});
    if (body.subPrice) {
      if (body.subPrice > user!.subPrice) {
        await SubscriberModel.updateMany({target: uuid}, {$set: {reBill: false}});
        const msg = {
          type: NotificationType.subPriceIncrease,
          from: uuid,
          beforePrice: user!.subPrice,
          afterPrice: body.subPrice
        };
        await notificationProducer.publish(JSON.stringify(msg))
      }
    }
    const updatedUser = await UserModel.findOneAndUpdate({uuid}, body);
    await createUserWatermarker(updatedUser!);
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL})
  }
}
