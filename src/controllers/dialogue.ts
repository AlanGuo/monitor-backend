import {Controller, GET, POST} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import DialogueModel from "../models/dialogue";
import MessageModel from "../models/message"
import {jsonResponse} from "@src/infrastructure/utils";
import {
  BillType,
  ConsumeType,
  DialogueStatus,
  MEDIA_TYPE,
  NotificationType,
  RESPONSE_CODE
} from "@src/infrastructure/utils/constants";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {Pagination} from "@src/interface";
import {getMediaUrl} from "@src/infrastructure/amazon/mediaConvert";
import messageModel from "@src/models/message";
import messagePaymentModel from "@src/models/messagePayment";
import talkPaymentModel from "@src/models/talkPayment";
import {getSignedUrl} from "@src/infrastructure/amazon/cloudfront";
import {Types} from "mongoose";
import userModel from "@src/models/user";
import BillModel from "@src/models/bill";
import {notificationProducer} from "@src/services/producer/notificationProducer";
import user from "@src/models/user";

@Controller({prefix: "/dialogue"})
export default class UserController {

  @GET("/list")
  @AuthRequired()
  @PaginationDec()
  async getDialogues(ctx: IRouterContext, next: any) {
    const pagination = ctx.state.pagination;
    const user = ctx.query.user;
    const fields = {
      $project: {
        _id: 0,
        from: 1,
        to: 1,
        status: 1,
        "user.uuid": 1,
        "user.avatar": 1,
        "user.name": 1,
        "user.displayName": 1,
        "lastMessage.content": 1,
        "lastMessage.createdAt": 1
      }
    }
    const innerUser = {
      $lookup: {
        from: "users",
        localField: "to",
        foreignField: "uuid",
        as: "user"
      }
    };
    const getLastMessage = {
      $lookup: {
        from: "messages",
        let: {from: "$from", to: "$to"},
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {$and: [{$eq: ["$from", "$$from"]}, {$eq: ["$to", "$$to"]}]},
                  {$and: [{$eq: ["$from", "$$to"]}, {$eq: ["$to", "$$from"]}]},
                ]
              }
            }
          },
          {$sort: {_id: -1}},
          {$limit: 1}
        ],
        as: "lastMessage"
      }
    };
    const sort = {$sort: {updateAt: -1}};
    const skip = {$skip: pagination.offset};
    const limit = {$limit: pagination.limit};

    let aggregations;
    if (user) {
      // search displayName and name
      aggregations = [
        {
          $match: {
            from: ctx.state.user.uuid
          }
        },
        innerUser,
        {
          $match: {
            $or: [
              {"user.name": {$regex: new RegExp(user, "i")}},
              {"user.displayName": {$regex: new RegExp(user, "i")}}
            ]
          }
        },
        sort, skip, limit, getLastMessage, fields
      ];
    } else {
      aggregations = [
        {
          $match: {
            from: ctx.state.user.uuid,
            show: true
          }
        },
        sort, skip, limit, innerUser, getLastMessage, fields
      ];
    }
    const dialogues = await DialogueModel.aggregate(aggregations);
    dialogues.forEach((item) => {
      if (!/https?/i.test(item.user[0].avatar)) {
        item.user[0].avatar = getSignedUrl(item.user[0].avatar);
      }
    })
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: dialogues})
  }

  @GET("/unread")
  @AuthRequired()
  async unreadNum(ctx: IRouterContext) {
    const uuid = ctx.state.user.uuid;
    const unread = await DialogueModel.find({from: uuid, status: DialogueStatus.newMessage})
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: unread.length})
  }

  @GET("/messages/:uuid")
  @AuthRequired()
  @PaginationDec()
  async messages(ctx: IRouterContext, next: any) {
    const pagination = ctx.state.pagination as Pagination;
    const fields = {
      _id: 1,
      from: 1,
      to: 1,
      content: 1,
      createdAt: 1,
      price: 1,
      "media.type": 1,
      "media.fileName": 1,
      "media.size": 1,
      "payment.messageId": 1
    };
    const messages = await MessageModel.aggregate([
      {
        $match: {
          createdAt: {$lte: new Date(Number(ctx.query.timeline) || Date.now())},
          $or: [
            {from: ctx.state.user.uuid, to: Number(ctx.params.uuid)},
            {from: Number(ctx.params.uuid), to: ctx.state.user.uuid}
          ]
        }
      },
      {$sort: {_id: -1}},
      {$skip: pagination.offset},
      {$limit: pagination.limit},
      {
        $lookup: {
          from: "messagepayments",
          let: {id: "$_id"},
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$messageId", "$$id"]
                }
              },
            }
          ],
          as: "payment"
        }
      },
      {
        $lookup: {
          from: "media",
          let: {mediaIds: "$media"},
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$fileName", "$$mediaIds"],
                }
              },
            }
          ],
          as: "media"
        }
      },
      {$project: fields},
    ]);

    messages.forEach(item => {
      // 是否有人付款过
      item.payed = item.payment.length > 0;
      // 针对当前用户是否付款 免费消息和发送人默认已付费
      item.payment = item.price <= 0 || item.payment.length > 0 || item.from === ctx.state.user.uuid;
      item.media.forEach((media: { type: MEDIA_TYPE, fileName: string, [any: string]: any }) => {
        media.urls = getMediaUrl(media.type, media.fileName, item.payment, media.size);
        media.ready = true;
      })
    });
    await DialogueModel.updateOne({
      from: ctx.state.user.uuid,
      to: ctx.params.uuid
    }, {$set: {status: DialogueStatus.read}})
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: messages})
  }

  @GET("/message/:id")
  @AuthRequired()
  async message(ctx: IRouterContext, next: any) {
    const id = ctx.params.id;
    const fields = {
      _id: 1,
      from: 1,
      to: 1,
      content: 1,
      createdAt: 1,
      price: 1,
      "media.type": 1,
      "media.fileName": 1,
      "media.size": 1,
      "payment.messageId": 1
    };
    const messages = await MessageModel.aggregate([
      {
        $match: {
          _id: Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: "messagepayments",
          let: {id: "$_id"},
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$messageId", "$$id"]
                }
              },
            }
          ],
          as: "payment"
        }
      },
      {
        $lookup: {
          from: "media",
          let: {mediaIds: "$media"},
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$fileName", "$$mediaIds"],
                }
              },
            }
          ],
          as: "media"
        }
      },
      {$project: fields},
    ]);
    messages.forEach(item => {
      // 是否有人付款过
      item.payed = item.payment.length > 0;
      // 针对当前用户是否付款 免费消息和发送人默认已付费
      item.payment = item.price <= 0 || item.payment.length > 0 || item.from === ctx.state.user.uuid;
      item.media.forEach((media: { type: MEDIA_TYPE, fileName: string, [any: string]: any }) => {
        media.urls = getMediaUrl(media.type, media.fileName, item.payment, media.size);
        media.ready = true;
      })
    });

    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: messages[0]})
  }

  @POST("/message/pay/:id")
  @AuthRequired()
  async pay(ctx: IRouterContext, next: any) {
    const uuid: number = ctx.state.user.uuid;
    const msgId: string = ctx.params.id;

    const session = await messageModel.db.startSession({
      defaultTransactionOptions: {
        readConcern: {level: "snapshot"},
        writeConcern: {w: "majority"}
      }
    });
    session.startTransaction();
    const user = await userModel.findOne({uuid}, {balance: 1}, {session});
    const msg = await messageModel.findOne({_id: msgId}, {price: 1, to: 1, from: 1}, {session});
    if (msg && uuid === msg.to && (msg.price ?? 0) > 0) {
      if (user!.balance >= msg.price) {
        const tmp = await messagePaymentModel.findOneAndUpdate(
          {uuid, messageId: msg._id},
          {$setOnInsert: {uuid, messageId: msg._id, price: msg.price, amount: msg.price}},
          {upsert: true, new: true, rawResult: true, session}
        )
        if (!tmp.lastErrorObject.updatedExisting) {
          user!.balance -= msg.price;
          await user!.save();
          await BillModel.create([{
            uuid: uuid,
            target: msg.from,
            type: BillType.consume,
            amount: msg.price,
            consumeType: ConsumeType.message,
            consumeId: tmp.value!._id
          }], {session})
          await session.commitTransaction();
          session.endSession();

          const message = {type: NotificationType.messagePay, msgId, from: uuid, uuid: msg.from};
          await notificationProducer.publish(JSON.stringify(message))

          ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL})
        } else {
          ctx.body = jsonResponse({code: RESPONSE_CODE.ERROR, msg: "has been payment"})
        }
      } else {
        ctx.body = jsonResponse({code: RESPONSE_CODE.BALANCE_NOT_ENOUGH})
      }
    } else {
      ctx.body = jsonResponse({code: RESPONSE_CODE.ERROR, msg: "msg not exists or msg belong you or msg is free"})
    }
    if (session.inTransaction()) {
      await session.abortTransaction();
      session.endSession();
    }
  }

  @POST("/pay/:uuid")
  @AuthRequired()
  async talkPay(ctx: IRouterContext, next: any) {
    const from: number = ctx.state.user.uuid;
    const to = Number(ctx.params.uuid);
    const session = await DialogueModel.db.startSession({
      defaultTransactionOptions: {
        readConcern: {level: "snapshot"},
        writeConcern: {w: "majority"}
      }
    });
    session.startTransaction();
    const userFrom = await userModel.findOne({uuid: from}, {balance: 1}, {session});
    const userTo = await userModel.findOne({uuid: to}, {chatPrice: 1}, {session});
    const dialogue = await DialogueModel.findOne({from, to}, {talkExpireTime: 1},{session});
    if (userTo!.chatPrice !== 0) {
      if (dialogue!.talkExpireTime > Date.now()) {
        ctx.body = jsonResponse()
      } else if (userFrom!.balance >= userTo!.chatPrice) {
        userFrom!.balance -= userTo!.chatPrice
        await userFrom!.save();
        dialogue!.talkExpireTime = Date.now() + 3600 * 12 * 1000;
        await dialogue!.save();
        const payments = await talkPaymentModel.create([{
          uuid: from,
          target: to,
          price: userTo!.chatPrice,
          amount: userTo!.chatPrice
        }], {session});
        await BillModel.create([{
          uuid: from,
          target: to,
          type: BillType.consume,
          amount: userTo!.chatPrice,
          consumeType: ConsumeType.talk,
          consumeId: payments[0]._id
        }], {session})
        await session.commitTransaction();
        session.endSession();
        ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL})
      } else {
        ctx.body = jsonResponse({code: RESPONSE_CODE.BALANCE_NOT_ENOUGH})
      }
    } else {
      ctx.body = jsonResponse()
    }
    if (session.inTransaction()) {
      await session.abortTransaction();
      session.endSession();
    }
  }

  @GET("/canTalk/:uuid")
  @AuthRequired()
  async canTalk(ctx: IRouterContext, next: any) {
    const from: number = ctx.state.user.uuid;
    const to = Number(ctx.params.uuid);
    const dialogue = await DialogueModel.findOne({from, to}, {_id: 0, talkExpireTime: 1});
    const userTo = await userModel.findOne({uuid: to}, {chatPrice: 1});
    const canTalk = userTo!.chatPrice > 0 ? dialogue!.talkExpireTime > Date.now() : true;
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: canTalk});
  }
}
