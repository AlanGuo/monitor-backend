import {Controller, GET, POST, DEL, PUT} from "@src/infrastructure/decorators/koa";
import { IRouterContext } from "koa-router";
import bankModel from "../models/bank";
import { jsonResponse } from "@src/infrastructure/utils";
import { RESPONSE_CODE } from "@src/infrastructure/utils/constants";
import { AuthRequired } from "@src/infrastructure/decorators/auth";
import { Types } from "mongoose";
@Controller({prefix: "/bankcard"})
export default class Kyc {

  @GET()
  @AuthRequired()
  async getBankcard(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const fields = {
      uuid: 1, nameOnCard: 1, cardNumber: 1, expiry: 1, cvc: 1, _id: 1
    };
    const bankcard = await bankModel.findOne({
      uuid
    }, fields).sort({
      _id: -1
    });
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: bankcard});
  }

  @POST()
  @AuthRequired()
  async newBankCard(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const body = ctx.request.body;
    const bankcard = await bankModel.create({
      uuid,
      nameOnCard: body.nameOnCard,
      cardNumber: body.cardNumber,
      expiry: body.expiry,
      cvc: body.cvc
    });
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: bankcard});
  }

  @PUT()
  @AuthRequired()
  async updateBankCard(ctx: IRouterContext, next: any) {
    const uuid = ctx.state.user.uuid;
    const body = ctx.request.body;
    const bankcard = await bankModel.updateOne({
      _id: Types.ObjectId(body.id)
    }, {
      uuid,
      nameOnCard: body.nameOnCard,
      cardNumber: body.cardNumber,
      expiry: body.expiry,
      cvc: body.cvc
    });
    ctx.body = jsonResponse({code: RESPONSE_CODE.NORMAL, data: bankcard});
  }
}