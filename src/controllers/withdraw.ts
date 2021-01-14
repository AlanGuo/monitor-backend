import {Controller, POST} from "@src/infrastructure/decorators/koa";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {IRouterContext} from "koa-router";
import WithdrawApplyModel from "@src/models/withdrawApply";
import {jsonResponse} from "@src/infrastructure/utils";
import {RESPONSE_CODE} from "@src/infrastructure/utils/constants";

@Controller({prefix: "/withdraw"})
export default class Withdraw {
  @POST("")
  @AuthRequired()
  async withdraw (ctx: IRouterContext) {
    // session
    // 查询可提现收入
    // 更新提现冻结时间
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL});
  }
}