import { Controller, POST } from "@src/infrastructure/decorators/koa";
import { IRouterContext } from "koa-router";


// todo: need to verity the signatures of Amazon SNS messages
@Controller({ prefix: "/callback" })
export default class CallbackController {
  @POST("/mediaconvertcomplete/notification")
  async notify(ctx: IRouterContext) {
    const body = ctx.request.body;
    console.log(body.MessageId, body.Type, body.Message, body.TopicArn, body.Timestamp);
    const records = body.Message.Records;
    for(let recordItem of records){
      const key = recordItem.object.key;
    }
  }
}