import {Controller, GET} from "@src/infrastructure/decorators/koa";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {IRouterContext} from "koa-router";
import {Pagination} from "@src/interface";
import RecommendUserModel from "@src/models/recommendUser";
import {jsonResponse} from "@src/infrastructure/utils";

@Controller({prefix: "/recommend"})
export default class RecommendUser {

  @GET("/list")
  @PaginationDec()
  async recommendList(ctx: IRouterContext, next: any) {
    const pagination: Pagination = ctx.state.pagination;
    const fields = {
      $project: {
        _id: 0,
        "user.uuid": 1,
        "user.avatar": 1,
        "user.name": 1,
        "user.displayName": 1,
        "user.bgImage": 1
      }
    }
    const recommend = await RecommendUserModel.aggregate([
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
    const total = await RecommendUserModel.estimatedDocumentCount()
    ctx.body = jsonResponse({
      data: {
        recommend, total, page: pagination.page, size: pagination.size
      }
    })
  }
}