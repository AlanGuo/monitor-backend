import {Controller, GET, POST} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import DialogueModel from "../models/dialogue";
import MessageModel from "../models/message"
import {jsonResponse} from "@src/infrastructure/utils";
import {MEDIA_TYPE, RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {Pagination} from "@src/interface";
import {getMediaUrl} from "@src/infrastructure/amazon/mediaConvert";
import messageModel from "@src/models/message";
import messagePaymentModel from "@src/models/messagePayment";
import { getSignedUrl } from "@src/infrastructure/amazon/cloudfront";
import {Types} from "mongoose";

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
                uuid: ctx.state.user.uuid,
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
      item.payment = item.price <= 0 || item.payment.length > 0 || item.from === ctx.state.user.uuid;
      item.media.forEach((media: { type: MEDIA_TYPE, fileName: string, [any: string]: any }) => {
        media.urls = getMediaUrl(media.type, media.fileName, item.payment, media.size);
        media.ready = true;
      })
    });

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
                uuid: ctx.state.user.uuid,
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
    console.log(messages);
    messages.forEach(item => {
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
    const msg = await messageModel.findOne({_id: msgId});
    if (msg && uuid === msg.to && (msg.price ?? 0) > 0) {
      try {
        await messagePaymentModel.create({uuid, messageId: msg._id})
        ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL})
      } catch (e) {
        ctx.body = jsonResponse({code: RESPONSE_CODE.ERROR, msg: "has been payment"})
      }
    } else {
      ctx.body = jsonResponse({code: RESPONSE_CODE.ERROR, msg: "msg not exists or msg belong you or msg is free"})
    }
  }

  // for test
  @POST("/pay/:uuid")
  @AuthRequired()
  async talkPay(ctx: IRouterContext, next: any) {
    const from: number = ctx.state.user.uuid;
    const to = Number(ctx.params.uuid);
    await DialogueModel.updateOne({from, to}, {$inc: {canTalk: 1}});
    ctx.body = jsonResponse()
  }

  @GET("/canTalk/:uuid")
  @AuthRequired()
  async canTalk(ctx: IRouterContext, next: any) {
    const from: number = ctx.state.user.uuid;
    const to = Number(ctx.params.uuid);
    const dialogue = await DialogueModel.findOne({from, to}, {_id: 0, canTalk: 1});
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: dialogue ? dialogue.canTalk : -1})
  }
}
