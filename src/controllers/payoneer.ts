import config from "@src/infrastructure/utils/config";
import axios from "axios";
import {Controller, GET} from "@src/infrastructure/decorators/koa";
import {jsonResponse} from "@src/infrastructure/utils/helper";
import {IRouterContext} from "koa-router";
import {IUser} from "@src/models/user";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import cookie from "cookie";

@Controller({prefix: "/payoneer"})
export default class PayoneerController {

  @GET("/create/registration-link")
  @AuthRequired()
  async create(ctx: IRouterContext) {
    const user: IUser = ctx.state.user;
    let lang = "1";
    if (ctx.req.headers.cookie) {
      const cookies = cookie.parse(ctx.req.headers.cookie);
      if(cookies["next-i18next"] === "vi") {
        lang = "21";
      } else if (cookies["next-i18next"] === "cn") {
        lang = "4";
      }
    }
    const url = `${config.PAYONEER.host}/v2/programs/${config.PAYONEER.clientId}/payees/registration-link`;
    try {
      const res = await axios.post(url, {
        "payee_id": user.uuid.toString(),
        "client_session_id": user.uuid.toString(),
        "redirect_url": "https://mfans.com/u/{{payoneerid}}",
        "redirect_time": 10,
        "payout_methods_list": [
          "BANK"
        ],
        "registration_mode": "FULL",
        "lock_type": "NONE",
        "language_id": lang
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": config.PAYONEER.auth
        }
      });
      ctx.body = jsonResponse({
        data: {link: res.data.registration_link}
      });
    } catch(e) {
      console.error(e);
      throw e;
    }
  }
}