import {Controller, GET, POST, DEL, PUT} from "@src/infrastructure/decorators/koa";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {IRouterContext} from "koa-router";
import postModel from "@src/models/post";
import subscriberModel from "@src/models/subscriber";
import {jsonResponse} from "@src/infrastructure/utils";
import {MEDIA_TYPE, RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import {Pagination} from "@src/interface";
import {getMediaUrl} from "@src/infrastructure/amazon/mediaConvert";
import {Types} from "mongoose";

@Controller({prefix: "/post"})
export default class PostsController {

  @GET("/list")
  @AuthRequired()
  @PaginationDec()
  async getPosts(ctx: IRouterContext, next: any) {
    const pagination: Pagination = ctx.state.pagination;
    const uuid = ctx.state.user.uuid;
    const content = ctx.query.content;

    const fields = {
      _id: 1, from: 1, content: 1, createdAt: 1, like: 1, comment: 1, "media.type": 1, "media.fileName": 1,
      "user.uuid": 1, "user.name": 1, "user.displayName": 1, "user.avatar": 1
    };
    const followers = await subscriberModel.find({uuid}, {_id: 0, target: 1});
    const match: any = {from: {$in: followers.map(item => item.target)}, deleted: false};
    if (content) {
      match.content = {$regex: new RegExp(content, "i")}
    }
    const posts = await postModel.aggregate([
      {
        $match: match
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
    const total = await postModel.countDocuments(match);
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: {posts, total, page: pagination.page, size: pagination.size}})
  }

  @GET("/my/list")
  @AuthRequired()
  @PaginationDec()
  async getMyPosts(ctx: IRouterContext, next: any) {
    const pagination: Pagination = ctx.state.pagination;
    const uuid = ctx.state.user.uuid;
    const fields = {
      _id: 1,
      from: 1,
      content: 1,
      createdAt: 1,
      like: 1,
      comment: 1,
      "media.type": 1,
      "media.fileName": 1
    };
    const content = ctx.query.content;
    const match: any = {from: uuid, deleted: false};
    if (content) {
      match.content = {$regex: new RegExp(content, "i")}
    }
    const posts = await postModel.aggregate([
      {$match: match},
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
    const total = await postModel.countDocuments(match);
    ctx.body = jsonResponse({
      code: RESPONSE_CODE.NORMAL,
      data: {posts, total, page: pagination.page, size: pagination.size}
    })
  }

  @GET("/:id/list")
  @PaginationDec()
  async getUserPosts(ctx: IRouterContext, next: any) {
    const pagination: Pagination = ctx.state.pagination;
    const uuid = ctx.params.id;
    const fields = {
      _id: 1,
      from: 1,
      content: 1,
      createdAt: 1,
      like: 1,
      comment: 1,
      "media.type": 1,
      "media.fileName": 1
    };
    const content = ctx.query.content;
    const match: any = {from: Number(uuid), deleted: false};
    if (content) {
      match.content = {$regex: new RegExp(content, "i")}
    }
    const posts = await postModel.aggregate([
      {$match: match},
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
    const total = await postModel.countDocuments(match);
    ctx.body = jsonResponse({
      code: RESPONSE_CODE.NORMAL,
      data: {posts, total, page: pagination.page, size: pagination.size}
    })
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

  @DEL("/delete/:id")
  @AuthRequired()
  async del(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const id = ctx.params.id;
    await postModel.updateOne({from: uuid, _id: id}, {$set: {deleted: true}});
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL})
  }

  @PUT("/put/:id")
  @AuthRequired()
  async put(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const id = ctx.params.id;
    const data = ctx.request.body;
    const media = data.media?.map((item: any) => {
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
    const change: any = {};
    if (data.content) {
      change.content = data.content;
    }
    if (media && media.length > 0) {
      change.media = media
    }
    await postModel.updateOne({_id: id, from: uuid}, {$set: change});
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL})
  }

  @GET("/list/:id")
  @AuthRequired()
  async get(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const fields = {
      _id: 1, from: 1, content: 1, createdAt: 1, like: 1, comment: 1, "media.type": 1, "media.fileName": 1,
      "user.uuid": 1, "user.name": 1, "user.displayName": 1, "user.avatar": 1
    };
    const id = ctx.params.id;
    const followers = await subscriberModel.find({uuid}, {_id: 0, target: 1});
    const posts = await postModel.aggregate([
      {
        $match: {
          _id: Types.ObjectId(id),
          from: {$in: followers.map(item => item.target).concat([uuid])},
          deleted: false
        }
      },
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
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: posts[0]})

  }

}
