import config from "@src/infrastructure/utils/config";
import {Controller, POST} from "@src/infrastructure/decorators/koa";
import {jsonResponse} from "@src/infrastructure/utils/helper";
import {IRouterContext} from "koa-router";
import orderModel, {IOrder} from "@src/models/order";
import userModel from "@src/models/user";
import BillModel from "@src/models/bill";
import {AuthRequired} from "@src/infrastructure/decorators/auth";
import {BillType, OrderStatus, OrderType, SLACK_WEB_HOOK} from "@src/infrastructure/utils/constants";
import {CheckPaypalDepositAmount} from "@src/infrastructure/decorators/checkPaypalDepositAmount";
import {sendSlackWebHook} from "@src/infrastructure/slack";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const paypal = require("@paypal/checkout-server-sdk");

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
  @CheckPaypalDepositAmount()
  async create(ctx: IRouterContext) {
    //创建支付
    const body = ctx.request.body
    const paymentConfig = config.PAYPAL.payment
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      "intent": "CAPTURE",
      "application_context": {
        "shipping_preference": "NO_SHIPPING"
      },
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
    const paypalOrder = await client.execute(request);
    //写入数据库
    await orderModel.create<IOrder>({
      type: OrderType.deposit,
      amount: body.amount,
      currency: paymentConfig.currency,
      uuid: ctx.state.user.uuid,
      orderId: paypalOrder.result.id,
      status: OrderStatus.created,
      method: "paypal"
    });
    ctx.status = 200
    ctx.body = jsonResponse({
      data: {
        orderId: paypalOrder.result.id,
      }
    });
  }

  @POST("/execute")
  @AuthRequired()
  async execute(ctx: IRouterContext) {
    //执行支付
    const body = ctx.request.body
    const paypalOrderId = body.orderId
    const payerId = body.payerId
    const uuid = ctx.state.user.uuid

    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    //执行订单
    const capture = await client.execute(request);
    const amount = Number(capture.result.purchase_units[0].payments.captures[0].amount.value);

    const updateObj = {
      ip: ctx.request.headers["x-real-ip"],
      status: OrderStatus.payed,
      payerId,
      payAt: new Date()
    }
    const session = await orderModel.db.startSession();
    session.startTransaction();

    await orderModel.updateOne({
      orderId: paypalOrderId
    }, updateObj, {session});
    await userModel.updateOne({
      uuid
    }, {
      $inc: {
        balance: amount
      }
    }, {session});
    await BillModel.create([{uuid: uuid, type: BillType.deposit, rechargeId: paypalOrderId, amount}], {session})
    await session.commitTransaction();
    session.endSession();
    await sendSlackWebHook(SLACK_WEB_HOOK.DEPOSIT, `用户[https://mfans.com/u/${uuid}]充值$${amount}成功`);
    ctx.status = 200
    ctx.body = jsonResponse({
      data: {
        orderId: paypalOrderId
      }
    });
  }
}