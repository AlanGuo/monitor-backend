import config from "@src/infrastructure/utils/config";
import { Controller, POST } from "@src/infrastructure/decorators/koa";
import { jsonResponse } from "@src/infrastructure/utils/helper";
import { IRouterContext } from "koa-router";
import orderModel, { IOrder } from "@src/models/order";
import userModel, { IUser } from "@src/models/user";
import { OrderType, OrderStatus } from "@src/interface";
import { AuthRequired } from "@src/infrastructure/decorators/auth";
import { Types } from "mongoose";
const paypal = require("@paypal/checkout-server-sdk");

// paypal.configure({
//   "mode": config.PAYPAL.mode, //sandbox or live
//   "client_id": config.PAYPAL.clientId,
//   "client_secret": config.PAYPAL.clientSecret,
// });

let environment;
if (config.PAYPAL.mode === "sandbox") {
  environment = new paypal.core.SandboxEnvironment(config.PAYPAL.clientId, config.PAYPAL.clientSecret);
} else {
  environment = new paypal.core.LiveEnvironment(config.PAYPAL.clientId, config.PAYPAL.clientSecret);
}
const client = new paypal.core.PayPalHttpClient(environment);

@Controller({prefix: "/paypal"})
export default class PaypalController {

  @POST("/create")
  @AuthRequired()
  async create(ctx: IRouterContext) {
    //创建支付
    const body = ctx.request.body
    const paymentConfig = config.PAYPAL.payment
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      "intent": "CAPTURE",
      "purchase_units": [
        {
          "amount": {
            "currency_code": paymentConfig.currency.toUpperCase(),
            "value": Number(body.amount).toFixed(2)
          }
        }
      ]
    });
    //创建订单
    const order = await client.execute(request);
    //写入数据库
    await orderModel.create<IOrder>({
      type: OrderType.deposit,
      amount: body.amount,
      currency: paymentConfig.currency,
      uuid: ctx.state.user.uuid,
      status: OrderStatus.created,
      method: "paypal"
    });
    ctx.status = 200
    ctx.body = jsonResponse({
      data: {
        orderId: order.result.id,
      }
    });
  }

  @AuthRequired()
  @POST("/execute")
  async execute(ctx: IRouterContext) {
    //执行支付
    const body = ctx.request.body
    const orderId = body.orderId
    const paypalOrderId = body.paypalOrderId
    const uuid = ctx.state.user.uuid

    const request = new paypal.orders.OrdersAuthorizeRequest(paypalOrderId);
    request.requestBody({});
    
    //执行订单
    const authorization = await client.execute(request);
    const amount = Number(authorization.result.purchase_units[0]
        .amount.value)

    const updateObj = {
      ip: ctx.request.headers["x-real-ip"],
      status: OrderStatus.payed,
      orderId: paypalOrderId,
      payAt: new Date()
    }
    const session = await orderModel.db.startSession();
    session.startTransaction();
    
    await orderModel.updateOne({
      _id: Types.ObjectId(orderId)
    }, updateObj, { session });
    await userModel.updateOne({
      uuid
    }, {
      $inc: {
        balance: amount
      }
    }, {session});
    await session.commitTransaction();
    session.endSession();

    ctx.status = 200
    ctx.body = jsonResponse()
  }
}