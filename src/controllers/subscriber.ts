import {Controller, GET, POST} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import SubscriberModel from "../models/subscriber"
import SubscriberPaymentModel from "../models/subscriberPayment"
import UserModel from "../models/user"
import {jsonResponse} from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {Pagination} from "@src/interface";
import {getSignedUrl} from "@src/infrastructure/amazon/cloudfront";

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

  @GET("/check/:target")
  @AuthRequired()
  async checkSubscription(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const target = Number(ctx.params.target);
    const sub = await SubscriberModel.findOne({
      uuid,
      target
    });
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: !!sub});
  }

  @POST("/new/:target")
  @AuthRequired()
  async subNewUser(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const target = Number(ctx.params.target);
    if (target === uuid) {
      ctx.body = jsonResponse({code: RESPONSE_CODE.CAN_NOT_SUBSCRIBE_YOURSELF});
    } else {
      const session = await SubscriberModel.db.startSession({
        defaultTransactionOptions: {
          readConcern: {level: "snapshot"},
          writeConcern: {w: "majority"}
        }
      });
      session.startTransaction()
      const targetUser = await UserModel.findOne({uuid: target}, {subPrice: 1}, {session});
      const user = await UserModel.findOne({uuid}, {balance: 1}, {session})
      if (targetUser && user) {
        if (user.balance >= targetUser.subPrice) {
          user.balance -= targetUser.subPrice
          await user.save();
          await SubscriberPaymentModel.create([{
            uuid,
            target,
            amount: targetUser.subPrice,
            price: targetUser.subPrice
          }], {session})
          const sub = await SubscriberModel.findOne({uuid, target}, {expireAt: 1}, {session})
          if (sub) {
            // TODO 自然月
            sub.expireAt += 1000 * 60 * 60 * 24 * 30
            await sub.save()
          } else {
            // TODO 自然月
            const createAt = Date.now()
            await SubscriberModel.create([{uuid, target, createAt, expireAt: createAt + 1000 * 60 * 60 * 24 * 30}], {session})
          }
          await session.commitTransaction()
          session.endSession()
          ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
        } else {
          ctx.body = jsonResponse({code: RESPONSE_CODE.BALANCE_NOT_ENOUGH});
        }
      } else {
        ctx.body = jsonResponse({code: RESPONSE_CODE.USER_NOT_EXISTS});
      }
    }
  }

  @POST("/cancel/:target")
  @AuthRequired()
  async CancelSubUser(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const target = Number(ctx.params.target);
    if (target === uuid) {
      ctx.body = jsonResponse({code: RESPONSE_CODE.CAN_NOT_UNSUBSCRIBE_YOURSELF});
    } else {
      await SubscriberModel.updateOne({
        uuid,
        target
      }, {$set: {expireAt: Date.now()}});
      ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
    }
  }

  @GET("/my/following")
  @AuthRequired()
  @PaginationDec()
  async following(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const pagination: Pagination = ctx.state.pagination;
    const fields = {
      $project: {
        _id: 0,
        "user.uuid": 1,
        "user.avatar": 1,
        "user.name": 1,
        "user.bgImage": 1,
        "user.displayName": 1
      }
    }
    const match: any = {uuid};
    if (ctx.query.search) {
      const reg = new RegExp(ctx.query.search, "i")
      let filter = {}
      if (!isNaN(Number(ctx.query.search))) {
        filter = {uuid: {$ne: uuid}, $or: [{uuid: ctx.query.search}, {displayName: reg}, {name: reg}]}
      } else {
        filter = {uuid: {$ne: uuid}, $or: [{displayName: reg}, {name: reg}]}
      }
      const tmp = await UserModel.find(filter, {_id: 0, uuid: 1})
      match.target = {$in: tmp.map(item => item.uuid)}
    }
    const tmp = await SubscriberModel.aggregate([
      {$match: match},
      {$sort: {_id: -1}},
      {$skip: pagination.offset},
      {$limit: pagination.limit},
      {
        $lookup: {
          from: "users",
          localField: "target",
          foreignField: "uuid",
          as: "user"
        }
      },
      fields
    ])
    const following = tmp.map(item => {
      const user = item.user[0]
      if (user.bgImage) {
        user.bgImage = getSignedUrl(user.bgImage);
      }
      if (!/https?/i.test(user.avatar)) {
        user.avatar = getSignedUrl(user.avatar);
      }
      return user
    })
    const total = await SubscriberModel.countDocuments(match)
    ctx.body = jsonResponse({data: {following, total, page: pagination.page, size: pagination.size}})
  }

  @GET("/my/fans")
  @AuthRequired()
  @PaginationDec()
  async fans(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const pagination: Pagination = ctx.state.pagination;
    const fields = {
      $project: {
        _id: 0,
        "user.uuid": 1,
        "user.avatar": 1,
        "user.name": 1,
        "user.bgImage": 1,
        "user.displayName": 1,
        "followed": 1,
        "createdAt": 1,
        "expireAt": 1,
        "reBill": 1
      }
    }
    const match: any = {target: uuid};
    if (ctx.query.search) {
      const reg = new RegExp(ctx.query.search, "i")
      let filter = {}
      if (!isNaN(Number(ctx.query.search))) {
        filter = {uuid: {$ne: uuid}, $or: [{uuid: ctx.query.search}, {displayName: reg}, {name: reg}]}
      } else {
        filter = {uuid: {$ne: uuid}, $or: [{displayName: reg}, {name: reg}]}
      }
      const tmp = await UserModel.find(filter, {_id: 0, uuid: 1})
      match.uuid = {$in: tmp.map(item => item.uuid)}
    }
    const tmp = await SubscriberModel.aggregate([
      {$match: match},
      {$sort: {_id: -1}},
      {$skip: pagination.offset},
      {$limit: pagination.limit},
      {
        $lookup: {
          from: "users",
          localField: "uuid",
          foreignField: "uuid",
          as: "user"
        }
      },
      {
        $lookup: {
          from: "subscribers",
          let: {uuid: "$uuid"},
          pipeline: [
            {
              $match: {
                uuid,
                $expr: {
                  $eq: ["$target", "$$uuid"]
                }
              }
            }
          ],
          as: "followed"
        }
      },
      fields
    ])
    const fans = tmp.map(item => {
      const user = item.user[0]
      if (user.bgImage) {
        user.bgImage = getSignedUrl(user.bgImage);
      }
      if (!/https?/i.test(user.avatar)) {
        user.avatar = getSignedUrl(user.avatar);
      }
      return {...user, followed: item.followed.length > 0}
    })
    const total = await SubscriberModel.countDocuments(match)
    ctx.body = jsonResponse({data: {fans, total, page: pagination.page, size: pagination.size}})
  }
}