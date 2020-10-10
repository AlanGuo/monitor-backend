import config from "@src/infrastructure/utils/config";
import { Controller, POST } from "@src/infrastructure/decorators/koa";
import paypal from "paypal-rest-sdk";
import { jsonResponse } from "@src/infrastructure/utils/helper";
import { IRouterContext } from "koa-router";
import Order, { IOrder } from "@src/models/order";
import { OrderType, OrderStatus } from "@src/interface";
import { AuthRequired } from "@src/infrastructure/decorators/auth";
import { Types } from "mongoose";

paypal.configure({
  "mode": config.PAYPAL.mode, //sandbox or live
  "client_id": config.PAYPAL.clientId,
  "client_secret": config.PAYPAL.clientSecret,
});

@Controller({prefix: "/paypal"})
export default class PaypalController {

  @POST("/create")
  @AuthRequired()
  async create(ctx: IRouterContext) {
    //创建支付
    const body = ctx.request.body
    const paymentConfig = config.PAYPAL.payment
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": config.HOST + "/deposit/success",
        "cancel_url": config.HOST
      },
      "transactions": [{
          "item_list": {
            "items": [{
              "name": paymentConfig.name,
              "sku": paymentConfig.name,
              "price": body.price,
              "currency": paymentConfig.currency,
              "quantity": 1
            }]
          },
          "amount": {
            "currency": paymentConfig.currency,
            "total": body.price
          },
          "description": `Deposit ${body.price}${paymentConfig.sign} to MFans.`
      }]
    }

    const promiseArr = []
   
    //写入数据库
    if(body.promiseID){
      promiseArr.push(Order.create({
        type: OrderType.deposit,
        amount: body.price,
        currency: paymentConfig.currency,
        uuid: ctx.state.user.uuid,
        status: OrderStatus.created
      }));
    }
    //创建支付
    promiseArr.push(new Promise((resolve, reject)=>{
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          //throw error;
          reject(error)
        } else {
          console.info("Create Payment Response")
          resolve(payment)
        }
      })
    }).catch(e=>{
      console.error(e)
    }))
    
    return Promise.all(promiseArr).then(res=>{
      const order = res[0] as IOrder, payment: any = res[1]
      ctx.status = 200
      ctx.body = jsonResponse({
        orderId: order._id,
        paymentID: payment.id
      });
    }).catch(e=>{
      console.error(e)
    })
  }

  @AuthRequired()
  @POST("/execute")
  async execute(ctx: IRouterContext) {
    //执行支付
    const body = ctx.request.body
    const orderId = body.orderId
    const paymentId = body.paymentId
    const paymentConfig = config.PAYPAL.payment

    const execute_payment_json = {
      "payer_id": body.payerID,
      "transactions": [{
        "amount": {
          "currency": paymentConfig.currency,
          "total": body.price
        },
      }]
    };
    
    return new Promise((resolve, reject)=>{
      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
          console.error(error.response.details)
          reject(error)
        } else {
          console.info("Get Payment Response");
          let updateObj = {
            ip: ctx.request.headers["x-real-ip"],
            status: OrderStatus.payed,
            paymentId,
            payAt: new Date()
          }
          Order.update(updateObj, {
            where: {
              orderId: Types.ObjectId(orderId)
            }
          }).then(res => {
            ctx.status = 200
            ctx.body = jsonResponse(ctx.request)
            resolve(ctx.body)
          }).catch(e=>{
            console.error(e)
            reject(e)
          })
        }
      })
    })
  }
}