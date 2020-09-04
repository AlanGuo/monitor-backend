import {Controller, GET, POST} from "@src/infrastructure/decorators/koa";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {IRouterContext} from "koa-router";
import postModel from "@src/models/post";
import {jsonResponse} from "@src/infrastructure/utils";
import {MEDIA_TYPE, RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import {Pagination} from "@src/interface";

@Controller({prefix: "/posts"})
export default class PostsController {

  @GET("/list")
  @AuthRequired()
  @PaginationDec()
  async getPosts(ctx: IRouterContext, next: any) {
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: []})
  }

  @POST("/new")
  @AuthRequired()
  @PaginationDec()
  async new(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const data = ctx.request.body;
    const media = data.media.map((item: any) => {
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
      content: data.content,
    });
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL})
  }
}
