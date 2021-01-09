import {Controller, GET, PUT} from "@src/infrastructure/decorators/koa";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {IRouterContext} from "koa-router";
import NotificationModel from "@src/models/notification";
import UserModel from "@src/models/user";
import PostModel from "@src/models/post";
import MessageModel from "@src/models/message";
import {jsonResponse} from "@src/infrastructure/utils";
import {
  NotificationClassify,
  NotificationInteractions,
  NotificationSpecial,
  NotificationOther,
  NotificationPurchases,
  NotificationStatus,
  NotificationSubscription,
  NotificationType,
  RESPONSE_CODE
} from "@src/infrastructure/utils/constants";
import {Pagination} from "@src/interface";
import {getSignedUrl} from "@src/infrastructure/amazon/cloudfront";
import {getOnlineUser} from "@src/infrastructure/redis";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {Types} from "mongoose";

@Controller({prefix: "/notification"})
export default class Notification {
  @GET("/unread")
  @AuthRequired()
  async unReadNum(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const unread = await NotificationModel.countDocuments({
      uuid, type: {$nin: NotificationSpecial},
      status: NotificationStatus.unread
    })
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: unread})
  }

  @PUT("/read/:id")
  @AuthRequired()
  async read(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const notificationId = ctx.params.id;
    const notification = await NotificationModel.findOne({uuid, _id: notificationId});
    if (notification) {
      notification.status = NotificationStatus.read;
      await notification.save();
      ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL})
    } else {
      ctx.body = jsonResponse({
        code: RESPONSE_CODE.SHOW_MESSAGE,
        msg: "the notification not exists or not belong with you"
      })
    }
  }

  @PUT("/readall")
  @AuthRequired()
  async readAll(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    await NotificationModel.updateMany({
      uuid,
      type: {$nin: NotificationSpecial},
      status: NotificationStatus.unread
    }, {$set: {status: NotificationStatus.read}});
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL})
  }

  @GET("/list")
  @AuthRequired()
  @PaginationDec()
  async list(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const pagination = ctx.state.pagination as Pagination;
    const match: any = {uuid}
    switch (ctx.query.tab) {
      case NotificationClassify.interactions:
        match.type = {$in: NotificationInteractions};
        break;
      case NotificationClassify.purchases:
        match.type = {$in: NotificationPurchases};
        break;
      case NotificationClassify.subscription:
        match.type = {$in: NotificationSubscription};
        break;
      case NotificationClassify.other:
        match.type = {$in: NotificationOther};
        break;
    }
    const tmpNotifications = await NotificationModel
      .find(match)
      .sort({_id: -1}).skip(pagination.offset).limit(pagination.limit);
    const total = await NotificationModel.countDocuments(match)

    const userFields = {uuid: 1, name: 1, displayName: 1, avatar: 1};
    const postFields = {content: 1}
    const messageFields = {content: 1}
    const notifications = await Promise.all(tmpNotifications.map(async item => {
      const user = item.from ? await UserModel.findOne({uuid: item.from}, userFields) : null;
      const post = item.postId ? await PostModel.findOne({_id: item.postId}, postFields) : null;
      const message = item.messageId ? await MessageModel.findOne({_id: item.messageId}, messageFields) : null;
      const data = {...item.toJSON()};
      if (user) {
        const sid = await getOnlineUser(item.from!);
        data.from = {
          ...user.toJSON(),
          avatar: (!/https?/i.test(user!.avatar!)) ? getSignedUrl(user!.avatar!) : user!.avatar!,
          online: !!sid
        }
      }
      if (message) {
        data.message = {...message.toJSON()}
      }
      if (post) {
        data.post = {...post.toJSON()}
      }
      return data
    }))

    ctx.body = jsonResponse({
      code: RESPONSE_CODE.NORMAL,
      data: {notifications, total, page: pagination.page, size: pagination.size}
    })
  }

  @GET("/special")
  @AuthRequired()
  // @PaginationDec()
  async specialList(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const match = {uuid, type: {$in: NotificationSpecial}, status: NotificationStatus.unread};
    const tmpNotifications = await NotificationModel
      .find(match)
      .sort({_id: -1}).limit(10);

    const userFields = {uuid: 1, name: 1, displayName: 1};
    const notifications = await Promise.all(tmpNotifications.map(async item=>{
      const user = item.from ? await UserModel.findOne({uuid: item.from}, userFields) : null;
      return {...item.toJSON(), from: {...user!.toJSON()}}
    }))
    ctx.body = jsonResponse({
      code: RESPONSE_CODE.NORMAL,
      data: {notifications}
    })
  }
}