import {Controller, GET, POST} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import SubscriberModel from "../models/subscriber"
import UserModel from "../models/user"
import {jsonResponse} from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {Pagination} from "@src/interface";

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
      const sub = await SubscriberModel.findOne({
        uuid,
        target
      });
      if (!sub) {
        await SubscriberModel.create({
          uuid,
          target
        });
      }
      ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
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
      await SubscriberModel.deleteOne({
        uuid,
        target
      });
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
      if(!isNaN(Number(ctx.query.search))){
        filter = {uuid: {$ne: uuid}, $or: [{uuid: ctx.query.search}, {displayName: reg}, {name: reg}]}
      } else {
        filter = {uuid: {$ne: uuid}, $or: [{displayName: reg}, {name: reg}]}
      }
      const tmp = await UserModel.find(filter, {_id:0, uuid: 1})
      match.target = {$in: tmp.map(item=>item.uuid)}
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
      return item.user[0]
    })
    const total = await SubscriberModel.countDocuments({uuid})
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
        "user.displayName": 1
      }
    }
    const match: any = {target: uuid};
    if (ctx.query.search) {
      const reg = new RegExp(ctx.query.search, "i")
      let filter = {}
      if(!isNaN(Number(ctx.query.search))){
        filter = {uuid: {$ne: uuid}, $or: [{uuid: ctx.query.search}, {displayName: reg}, {name: reg}]}
      } else {
        filter = {uuid: {$ne: uuid}, $or: [{displayName: reg}, {name: reg}]}
      }
      const tmp = await UserModel.find(filter, {_id:0, uuid: 1})
      match.uuid = {$in: tmp.map(item=>item.uuid)}
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
      fields
    ])
    const fans = tmp.map(item => {
      return item.user[0]
    })
    const total = await SubscriberModel.countDocuments({target: uuid})
    ctx.body = jsonResponse({data: {fans, total, page: pagination.page, size: pagination.size}})
  }
}