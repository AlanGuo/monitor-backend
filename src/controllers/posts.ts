import {Controller, GET, POST} from "@src/infrastructure/decorators/koa";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {IRouterContext} from "koa-router";
import postModel from "@src/models/post";
import subscriberModel from "@src/models/subscriber";
import {jsonResponse} from "@src/infrastructure/utils";
import {MEDIA_TYPE, RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import {Pagination} from "@src/interface";
import {getMediaUrl} from "@src/infrastructure/amazon/mediaConvert";

@Controller({prefix: "/posts"})
export default class PostsController {

  @GET("/list")
  @AuthRequired()
  @PaginationDec()
  async getPosts(ctx: IRouterContext, next: any) {
    const pagination: Pagination = ctx.state.pagination;
    const uuid = ctx.state.user.uuid;
    const fields = {
      _id: 0, from: 1, content: 1, createdAt: 1, like: 1, comment: 1, "media.type": 1, "media.fileName": 1,
      "user.uuid": 1, "user.name": 1, "user.displayName": 1
    };
    const followers = await subscriberModel.find({uuid}, {_id: 0, target: 1});
    const posts = await postModel.aggregate([
      {
        $match: {from: {$in: followers.map(item => item.target)}}
      },
      {$sort: {_id: -1}},
      {$skip: pagination.offset},
      {$limit: pagination.limit},
      {
        $lookup: {
          from: "users",
          localField: "from",
          foreignField: "uuid",
          as: "user"
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
    posts.forEach(item => {
      item.media.forEach((media: { type: MEDIA_TYPE, fileName: string, [any: string]: any }) => {
        media.urls = getMediaUrl(media.type, media.fileName);
        media.ready = true;
      })
    });
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: {posts}})
  }

  @GET("/my/list")
  @AuthRequired()
  @PaginationDec()
  async getMyPosts(ctx: IRouterContext, next: any) {
    const pagination: Pagination = ctx.state.pagination;
    const uuid = ctx.state.user.uuid;
    const fields = {
      _id: 0,
      from: 1,
      content: 1,
      createdAt: 1,
      like: 1,
      comment: 1,
      "media.type": 1,
      "media.fileName": 1
    };
    const posts = await postModel.aggregate([
      {
        $match: {from: uuid}
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
          as: "media"
        }
      },
      {$project: fields},
    ]);
    posts.forEach(item => {
      item.media.forEach((media: { type: MEDIA_TYPE, fileName: string, [any: string]: any }) => {
        media.urls = getMediaUrl(media.type, media.fileName);
        media.ready = true;
      })
    });
    const total = await postModel.countDocuments({from: uuid});
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: {posts, total}})
  }

  @POST("/new")
  @AuthRequired()
  async new(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const data = ctx.request.body;
    const media = data.media.map((item: any) => {
      if (item.fileName) {
        return item.fileName
      }
      switch (item.type) {
        case MEDIA_TYPE.VIDEO:
          return item.key.split("/")[1].split(".")[0];
        case MEDIA_TYPE.IMAGE:
          return item.key.split("/")[1]
      }
    });
    await postModel.create({
      from: uuid,
      media,
      content: data.content
    });
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL})
  }
}
