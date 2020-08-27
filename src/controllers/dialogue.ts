import {Controller, GET} from "@src/infrastructure/decorators/koa";
import KoaRouter, {IRouterContext} from "koa-router";
import DialogueModel from "../models/dialogue";
import MediaModel from "../models/media"
import MessageModel from "../models/message"
import {jsonResponse} from "@src/infrastructure/utils";
import {MEDIA_PURPOSE, MEDIA_TYPE, RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {Pagination} from "@src/interface";
import {getMediaUrl} from "@src/infrastructure/amazon/mediaConvert";

@Controller({prefix: "/dialogue"})
export default class UserController {

  @GET("/list")
  @AuthRequired()
  @PaginationDec()
  async getDialogues(ctx: IRouterContext, next: any) {
    const pagination = ctx.state.pagination;

    const dialogues = await DialogueModel.aggregate([
      {
        $match: {
          from: ctx.state.user.uuid,
          show: true
        }
      },
      {
        $lookup: {
          localField: "to",
          from: "users",
          foreignField: "uuid",
          as: "userInfo"
        }
      },
      {
        $lookup: {
          from: "messages",
          let: {form: "$from", to: "$to"},
          pipeline: [
            {
              $match: {
                $or: [

                  {$expr: {$eq: ["$from", "$$from"],}}
                ]
              }
            },
            {$sort: {_id: -1}},
            {$limit: 1}
          ],
          as: "lastMessage"
        }
      },
      {
        $project: {
          _id: 0, from: 1, to: 1, "userInfo.displayName": 1
        }
      },
    ]);
    console.log(JSON.stringify(dialogues));
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: dialogues})
  }

  @GET("/messages/:uuid")
  @AuthRequired()
  @PaginationDec()
  async messages(ctx: IRouterContext, next: any) {
    const pagination = ctx.state.pagination as Pagination;
    const fields = {
      _id: 0,
      from: 1,
      to: 1,
      content: 1,
      createdAt: 1,
      "media.type": 1,
      "media.fileName": 1
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
          as: 'media'
        }
      },
      {$project: fields},
    ]);

    messages.forEach(item => {
      item.media.forEach((media: {type: MEDIA_TYPE, fileName: string, [any: string]: any}) => {
        media.urls = getMediaUrl(media.type, media.fileName, MEDIA_PURPOSE.CHAT);
        media.ready = true;
      })
    });

    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: messages})
  }
}
