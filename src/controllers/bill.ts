import {Controller, GET} from "@src/infrastructure/decorators/koa";
import {PaginationDec} from "@src/infrastructure/decorators/pagination";
import {IRouterContext} from "koa-router";
import UserModel from "../models/user"
import {jsonResponse} from "@src/infrastructure/utils";


@Controller({prefix: "/bill"})
export default class BillController {

  @GET("/list")
  @PaginationDec()
  async list(ctx: IRouterContext) {
    const pagination = ctx.state.pagination;
    const filter = [];
    const type = ctx.query.type
    const bill = await UserModel.aggregate([

    ])
    ctx.body = jsonResponse();
  }
}