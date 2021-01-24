import {Controller, DEL, GET, POST, PUT} from "@src/infrastructure/decorators/koa";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {IRouterContext} from "koa-router";
import postModel from "@src/models/post";
import userModel from "@src/models/user";
import postPaymentModel from "@src/models/postPayment";
import subscriberModel from "@src/models/subscriber";
import {jsonResponse} from "@src/infrastructure/utils";
import {
  BillType,
  ConsumeType,
  MEDIA_TYPE,
  NotificationType,
  POST_STATUS,
  RESPONSE_CODE,
  SLACK_WEB_HOOK
} from "@src/infrastructure/utils/constants";
import {Pagination} from "@src/interface";
import {getMediaFileName, getMediaUrl} from "@src/infrastructure/amazon/mediaConvert";
import {Types} from "mongoose";
import {getSignedUrl} from "@src/infrastructure/amazon/cloudfront";
import BillModel from "@src/models/bill";
import {notificationProducer} from "@src/services/producer/notificationProducer";
import {CheckPostPrice} from "@src/infrastructure/decorators/checkPostPrice";
import {sendSlackWebHook} from "@src/infrastructure/slack";
import {createBill} from "@src/infrastructure/bill";

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
      _id: 1,
      from: 1,
      content: 1,
      createdAt: 1,
      like: 1,
      comment: 1,
      price: 1,
      tips: 1,
      "media.type": 1,
      "media.fileName": 1,
      "media.size": 1,
      "user.uuid": 1,
      "user.name": 1,
      "user.displayName": 1,
      "user.avatar": 1,
      "isLiked.uuid": 1,
      "payment.postId": 1
    };
    const followers = await subscriberModel.find({uuid, expireAt: {$gt: Date.now()}}, {_id: 0, target: 1});
    const matchFollowers = followers.map(item => item.target).concat([uuid])
    const match: any = {from: {$in: matchFollowers}, deleted: false};
    if (content) {
      match.content = {$regex: new RegExp(content, "i")}
    }
    const isLikeMatch: any = {
      uuid,
      $expr: {
        $eq: ["$postId", "$$id"]
      }
    }
    const paymentMatch: any = {
      uuid,
      $expr: {
        $eq: ["$postId", "$$id"]
      }
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
          from: "postpayments",
          let: {id: "$_id"},
          pipeline: [
            {
              $match: paymentMatch,
            }
          ],
          as: "payment"
        }
      },
      {
        $lookup: {
          from: "likes",
          let: {id: "$_id"},
          pipeline: [
            {
              $match: isLikeMatch,
            }
          ],
          as: "isLiked"
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
      if (!/https?/i.test(item.user[0].avatar)) {
        item.user[0].avatar = getSignedUrl(item.user[0].avatar);
      }
      item.payment = item.price <= 0 || item.payment.length > 0 || item.from === uuid;
      item.media.forEach((media: { type: MEDIA_TYPE, fileName: string, [any: string]: any, size: any }) => {
        media.urls = getMediaUrl(media.type, media.fileName, item.payment, media.size);
        media.ready = true;
      })
    });
    const total = await postModel.countDocuments(match);
    ctx.body = jsonResponse({
      code: RESPONSE_CODE.NORMAL,
      data: {posts, total, page: pagination.page, size: pagination.size}
    })
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
      price: 1,
      "media.size": 1,
      "media.type": 1,
      "media.fileName": 1,
      "isLiked.uuid": 1
    };
    const content = ctx.query.content;
    const match: any = {from: uuid, deleted: false};
    if (content) {
      match.content = {$regex: new RegExp(content, "i")}
    }
    const isLikeMatch: any = {
      $expr: {
        $eq: ["$postId", "$$id"]
      }
    }
    if (ctx.state.user) {
      isLikeMatch.uuid = ctx.state.user.uuid;
    }
    const posts = await postModel.aggregate([
      {$match: match},
      {$sort: {_id: -1}},
      {$skip: pagination.offset},
      {$limit: pagination.limit},
      {
        $lookup: {
          from: "likes",
          let: {id: "$_id"},
          pipeline: [
            {
              $match: isLikeMatch,
            }
          ],
          as: "isLiked"
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
      item.payment = true;
      item.media.forEach((media: { type: MEDIA_TYPE, fileName: string, [any: string]: any }) => {
        media.urls = getMediaUrl(media.type, media.fileName, true, media.size);
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
  @AuthRequired(false)
  @PaginationDec()
  async getUserPosts(ctx: IRouterContext, next: any) {
    const pagination: Pagination = ctx.state.pagination;
    const uuid = Number(ctx.params.id);
    const fields = {
      _id: 1,
      from: 1,
      content: 1,
      createdAt: 1,
      like: 1,
      comment: 1,
      price: 1,
      tips: 1,
      "media.size": 1,
      "media.type": 1,
      "media.fileName": 1,
      "isLiked.uuid": 1,
      "payment.postId": 1
    };
    const content = ctx.query.content;

    // 收费主播
    const user = await userModel.findOne({uuid}, {_id: 0, subPrice: 1, displayName: 1, avatar: 1, name: 1, broadcaster: 1});
    const needSub = user && user.broadcaster;

    const isFan = ctx.state.user ? needSub ? await subscriberModel.exists({
      uuid: ctx.state.user.uuid,
      target: uuid,
      expireAt: {$gt: Date.now()}
    }): true : false

    const userInfo: any = {...user?.toJSON(), uuid}
    if (user && !/https?/i.test(user.avatar!)) {
      userInfo.avatar = getSignedUrl(user.avatar!);
    }

    const match: any = {from: Number(uuid), deleted: false};
    if (content) {
      match.content = {$regex: new RegExp(content, "i")}
    }
    const isLikeMatch: any = {
      uuid: 0,
      $expr: {
        $eq: ["$postId", "$$id"]
      }
    }
    const paymentMatch: any = {
      uuid: 0,
      $expr: {
        $eq: ["$postId", "$$id"]
      }
    }
    if (ctx.state.user) {
      isLikeMatch.uuid = ctx.state.user.uuid;
      paymentMatch.uuid = ctx.state.user.uuid;
    }
    const posts = await postModel.aggregate([
      {$match: match},
      {$sort: {_id: -1}},
      {$skip: pagination.offset},
      {$limit: pagination.limit},
      {
        $lookup: {
          from: "postpayments",
          let: {id: "$_id"},
          pipeline: [
            {
              $match: paymentMatch,
            }
          ],
          as: "payment"
        }
      },
      {
        $lookup: {
          from: "likes",
          let: {id: "$_id"},
          pipeline: [
            {
              $match: isLikeMatch,
            }
          ],
          as: "isLiked"
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
      item.user = [userInfo];
      // 1. 付费过 可看
      // 2. 是自己 可看
      // 3. 是粉丝 post收费 不可看
      item.payment = item.payment.length > 0 || item.from === ctx.state.user.uuid || (isFan ? item.price > 0 ? item.payment.length > 0 : false : false);
      item.media.forEach((media: { type: MEDIA_TYPE, fileName: string, [any: string]: any }) => {
        media.urls = getMediaUrl(media.type, media.fileName, item.payment, media.size);
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
  @CheckPostPrice()
  async new(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const data = ctx.request.body;
    const media = data.media.map((item: any) => {
      if (item.fileName) {
        return item.fileName
      }
      return getMediaFileName(item.type, item.key)
    });
    const user = await userModel.findOne({uuid});
    const userSubPrice = user?.subPrice ? -1 : data.price ?? 0;
    const post = await postModel.create({
      from: uuid,
      status: POST_STATUS.NORMAL,
      media,
      price: userSubPrice,
      content: data.content,
      deleted: false
    });

    const msg = {type: NotificationType.newPost, post: {_id: post._id, from: uuid}};
    await notificationProducer.publish(JSON.stringify(msg))

    await sendSlackWebHook(SLACK_WEB_HOOK.POST, `[https://mfans.com/u/${uuid}] made a new post [https://mfans.com/post/${post._id}]`)
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
      return getMediaFileName(item.type, item.key)
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
      _id: 1,
      from: 1,
      content: 1,
      createdAt: 1,
      like: 1,
      tips: 1,
      price: 1,
      comment: 1,
      "media.type": 1,
      "media.fileName": 1,
      "media.size": 1,
      "user.uuid": 1,
      "user.name": 1,
      "user.displayName": 1,
      "user.avatar": 1,
      "payment.postId": 1,
      "isLiked.uuid": 1
    };
    const id = ctx.params.id;
    const followers = await subscriberModel.find({uuid, expireAt: {$gt: Date.now()}}, {_id: 0, target: 1});
    const matchFollowers = followers.map(item => item.target).concat([uuid]);
    const isLikeMatch: any = {
      uuid,
      $expr: {
        $eq: ["$postId", "$$id"]
      }
    }
    const posts = await postModel.aggregate([
      {
        $match: {
          _id: Types.ObjectId(id),
          // from: {$in: matchFollowers},
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
          from: "postpayments",
          let: {id: "$_id"},
          pipeline: [
            {
              $match: {
                uuid,
                $expr: {
                  $eq: ["$postId", "$$id"]
                }
              },
            }
          ],
          as: "payment"
        }
      },
      {
        $lookup: {
          from: "likes",
          let: {id: "$_id"},
          pipeline: [
            {
              $match: isLikeMatch,
            }
          ],
          as: "isLiked"
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
    const item = posts[0];
    if (item) {
      if (matchFollowers.indexOf(item.from) > -1) {
        if (!/https?/i.test(item.user[0].avatar)) {
          item.user[0].avatar = getSignedUrl(item.user[0].avatar);
        }
        item.payment = item.price <= 0 || item.payment.length > 0 || item.from === uuid;
        item.media.forEach((media: { type: MEDIA_TYPE, fileName: string, [any: string]: any }) => {
          media.urls = getMediaUrl(media.type, media.fileName, item.payment, media.size);
          media.ready = true;
        });
        ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: item});
      } else {
        ctx.body = jsonResponse({code: RESPONSE_CODE.NOT_SUBSCRIBING, data: posts[0].from});
      }
    } else {
      ctx.body = jsonResponse({code: RESPONSE_CODE.NOT_FOUND});
    }
  }

  @POST("/pay/:id")
  @AuthRequired()
  async pay(ctx: IRouterContext, next: any) {
    const uuid: number = ctx.state.user.uuid;
    const postId: string = ctx.params.id;
    const session = await postModel.db.startSession({
      defaultTransactionOptions: {
        readConcern: {level: "snapshot"},
        writeConcern: {w: "majority"}
      }
    });
    session.startTransaction();
    const user = await userModel.findOne({uuid}, {balance: 1}, {session});
    const post = await postModel.findOne({_id: postId}, {from: 1, price: 1}, {session});
    if (post && uuid !== post.from && (post.price ?? 0) > 0) {
      if (user!.balance >= post.price) {
        const tmp = await postPaymentModel.findOneAndUpdate(
          {uuid, postId: post._id},
          {$setOnInsert: {uuid, postId: post._id, price: post.price, amount: post.price}},
          {upsert: true, new: true, rawResult: true, session}
        );
        if (!tmp.lastErrorObject.updatedExisting) {
          user!.balance -= post.price;
          await user!.save();
          await createBill({
            uuid: uuid,
            target: post.from,
            type: BillType.consume,
            amount: post.price,
            consumeType: ConsumeType.post,
            consumeId: tmp.value!._id
          }, session);
          // await BillModel.create([{
          //   uuid: uuid,
          //   target: post.from,
          //   type: BillType.consume,
          //   amount: post.price,
          //   consumeType: ConsumeType.post,
          //   consumeId: tmp.value!._id
          // }], {session})
          await session.commitTransaction();
          session.endSession();

          const msg = {type: NotificationType.postPay, postId, from: uuid, uuid: post.from};
          await notificationProducer.publish(JSON.stringify(msg))
          await sendSlackWebHook(SLACK_WEB_HOOK.UNLOCK, `[https://mfans.com/u/${uuid}]解锁了post[https://mfans.com/post/${postId}]`);
          ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
        } else {
          // await session.abortTransaction()
          // session.endSession()
          ctx.body = jsonResponse({code: RESPONSE_CODE.ERROR, msg: "has been payment"})
        }
      } else {
        ctx.body = jsonResponse({code: RESPONSE_CODE.BALANCE_NOT_ENOUGH})
      }

    } else {
      ctx.body = jsonResponse({code: RESPONSE_CODE.ERROR, msg: "post not exists or post belong you or post is free"})
    }
    if (session.inTransaction()) {
      await session.abortTransaction();
      session.endSession();
    }
  }
}
