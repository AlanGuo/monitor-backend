import {Controller, GET, PUT} from "@src/infrastructure/decorators/koa";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {IRouterContext} from "koa-router";
import NotificationModel from "@src/models/notification";
import UserModel from "@src/models/user";
import {jsonResponse} from "@src/infrastructure/utils";
import {
  NotificationClassify, NotificationInteractions, NotificationOther, NotificationPurchases,
  NotificationStatus, NotificationSubscription, NotificationType,
  RESPONSE_CODE
} from "@src/infrastructure/utils/constants";
import {Pagination} from "@src/interface";
import {getSignedUrl} from "@src/infrastructure/amazon/cloudfront";
import {getOnlineUser} from "@src/infrastructure/redis";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";

@Controller({prefix: "/notification"})
export default class Notification {
  @GET("/unread")
  @AuthRequired()
  async unReadNum(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const unread = await NotificationModel.find({uuid, status: NotificationStatus.unread})
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: unread.length})
  }

  @PUT("/read/:id")
  @AuthRequired()
  async read(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const notificationId = ctx.params.id;
    const notification = await NotificationModel.findOne({_id: notificationId});
    if (notification && notification.uuid === uuid) {
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

    const userFields = {
      uuid: 1,
      name: 1,
      displayName: 1,
      avatar: 1,
    };
    const notifications = await Promise.all(tmpNotifications.map(async item => {
      switch (item.type) {
        case NotificationType.newPost:
        case NotificationType.postComment:
        case NotificationType.postLike:
        case NotificationType.commentLike:
        case NotificationType.commentReply:
        case NotificationType.postPay:
        case NotificationType.messagePay:
        case NotificationType.subCancel:
        case NotificationType.sub:
        case NotificationType.tip:
        case NotificationType.followReBill:
          const user = await UserModel.findOne({uuid: item.from}, userFields);
          const sid = await getOnlineUser(item.from!);
          return {...item, from: {...user, bgImage: getSignedUrl(user!.bgImage!), avatar: getSignedUrl(user!.avatar!), online: !!sid}}
        case NotificationType.kycPass:
        case NotificationType.kycVeto:
        case NotificationType.postTip:
        case NotificationType.followExpired:
        case NotificationType.subExpired:
          return {...item}
      }
    }))

    ctx.body = jsonResponse({
      code: RESPONSE_CODE.NORMAL,
      data: {notifications, total, page: pagination.page, size: pagination.size}
    })
  }
}