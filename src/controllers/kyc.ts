import {Controller, GET, POST, DEL} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import kycApplyModel from "../models/kycApply";
import { jsonResponse } from "@src/infrastructure/utils";
import {KYC_APPLY_STATUS, RESPONSE_CODE} from "@src/infrastructure/utils/constants";
import { AuthRequired } from "@src/infrastructure/decorators/auth";
import { getSignedUrl } from "@src/infrastructure/amazon/cloudfront";
import axios from "axios";
import config from "config";

@Controller({prefix: "/kyc"})
export default class Kyc {

  @GET()
  @AuthRequired()
  async getKyc(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const fields = {
      idNumber: 1, idCardFront: 1, idCardReverse: 1, handheld: 1, status: 1, reply: 1, idName: 1
    };
    const kyc = await kycApplyModel.findOne({
      uuid
    }, fields).sort({
      _id: -1
    });
    let kycData: any = null;
    if (kyc) {
      kycData = Object.assign({}, kyc.toJSON());
      kycData.idCardFrontUrl = getSignedUrl(kyc.idCardFront);
      kycData.idCardReverseUrl = getSignedUrl(kyc.idCardReverse);
      kycData.handheldUrl = getSignedUrl(kyc.handheld);
    }
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: kycData});
  }

  @POST()
  @AuthRequired()
  async newKyc(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const body = ctx.request.body;
    const kyc = await kycApplyModel.create({
      uuid,
      idNumber: body.idNumber,
      idName: body.idName,
      idCardFront: body.idFrontKey,
      idCardReverse: body.idBackKey,
      handheld: body.idHandKey,
      status: KYC_APPLY_STATUS.AUDIT
    });
    await axios.post(config.get("SLACK_WEB_HOOK"), {
      text: `您有新的KYC申请, 请群里有空的人尽快处理, 用户主页是: https://mfans.com/u/${uuid}`
    });
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: kyc});
  }
}