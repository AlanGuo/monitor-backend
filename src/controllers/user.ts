import {Controller, GET, PUT} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import UserModel from "../models/user";
import BillModel from "../models/bill";
import SubscriberModel from "../models/subscriber";
import InviteModel from "../models/invite";
import {jsonResponse} from "@src/infrastructure/utils";
import {BillType, FROZEN_INCOME_TIME, NotificationType, RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {getOnlineUser} from "@src/infrastructure/redis";
import {getSignedUrl} from "@src/infrastructure/amazon/cloudfront";
import {notificationProducer} from "@src/services/producer/notificationProducer";
import {createUserWatermarker} from "@src/infrastructure/utils/watermarker";
import {CheckChatPrice} from "@src/infrastructure/decorators/checkChatPrice";
import {CheckSubPrice} from "@src/infrastructure/decorators/checkSubPrice";
import BigNumber from "bignumber.js";
import {groupBy} from "lodash";

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

      incomeAmount: 1, // 收入（可提现和账期）
      freezeWithdrawAmount: 1, // 提现冻结中金额
      withdrawAmount: 1, // 已提现金额
      inviteAmount: 1, // 邀请收入
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
        const frozenBills = await BillModel.find({
          uuid,
          type: {$in: [BillType.earn, BillType.invite]},
          createdAt: {$gt: new Date(Date.now() - FROZEN_INCOME_TIME)}
        }, {
          _id: 0,
          amount: 1,
          createdAt: 1
        });
        const freezeBalance = frozenBills.map(item => item.amount).reduce((pre, cur) => new BigNumber(cur).plus(pre), new BigNumber(0));
        const total = new BigNumber(user.incomeAmount).plus(user.freezeWithdrawAmount).plus(user.withdrawAmount);
        rep.income = {
          total,
          balance: total.minus(freezeBalance).minus(user.freezeWithdrawAmount),
          freezeBalance,
          withdraw: user.withdrawAmount,
          freezeWithdraw: user.freezeWithdrawAmount,
          inviteAmount: user.inviteAmount
        };
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

  @GET("/me/invite")
  @AuthRequired()
  async getInviteInfo(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const invites = await InviteModel.find({inviteUser: uuid}, {
      _id: 0,
      uuid: 1,
      commissionAmount: 1,
      level: 1,
      indirectInviteUser: 1
    });
    const groupedInvites = groupBy(invites, item => item.indirectInviteUser || "index");
    const level1Invites = groupedInvites["index"];
    const data = level1Invites?.map(item => {
      return {
        ...item.toJSON(),
        level2: groupedInvites[item.uuid.toString()] || [],
        totalAmount: groupedInvites[item.uuid.toString()]?.map(item => item.commissionAmount).reduce((pre, cur) => new BigNumber(pre).plus(cur), new BigNumber(0)).plus(item.commissionAmount) || new BigNumber(item.commissionAmount)
      }
    }) || [];
    ctx.body = jsonResponse({
      data: {
        totalAmount: data.map(item => item.totalAmount).reduce((pre, cur) => new BigNumber(pre).plus(cur), new BigNumber(0)),
        data
      }
    });
  }
}
