import config from "@src/infrastructure/utils/config";
import {Controller, POST} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import {getOnlineUser, redis} from "@src/infrastructure/redis";
import {getSocketIO} from "@src/infrastructure/socket";
import {MEDIA_TYPE, SOCKET_CHANNEL} from "@src/infrastructure/utils/constants";
import {jsonResponse} from "@src/infrastructure/utils/helper";
import {mediaProducer} from "@src/services/producer/mediaProducer";
import {getMediaUrl} from "@src/infrastructure/amazon/mediaConvert";
import {ImageAmazonUrl, MediaConvertCache, VideoAmazonUrl} from "@src/interface";
import {mediaType} from "@src/infrastructure/utils";
import paypal from "paypal-rest-sdk";
import {getVideoDurationInSeconds} from "get-video-duration"

paypal.configure({
  "mode": config.PAYPAL.mode, //sandbox or live
  "client_id": config.PAYPAL.clientId,
  "client_secret": config.PAYPAL.clientSecret,
});

// todo: need to verity the signatures of Amazon SNS messages
@Controller({prefix: "/callback"})
export default class CallbackController {
  @POST("/mediaconvertcomplete/notification")
  async notify(ctx: IRouterContext) {
    const body = ctx.request.body;
    const message = JSON.parse(body.Message);
    const records = message.Records;
    for (const recordItem of records) {
      const fileName: string = decodeURIComponent(recordItem.s3.object.key);
      const ext = fileName.split(".").pop() ?? "";
      let redisKey = fileName.split(".")[0];
      // 视频文件有下划线分割"_"，这里把下划线也滤除
      // 图片文件分 glass, thumbnail 有下划线
      redisKey = redisKey.split("_")[0];
      const data = await redis.get(redisKey);
      let mediaInfo = mediaType(ext);
      if (fileName.indexOf("_screenshot") > -1) {
        // 视频截图
        mediaInfo = mediaType("mp4");
      }

      console.log("/mediaconvertcomplete/notification", fileName, ext, redisKey, mediaInfo, data);
      if (data) {
        const decodedData: MediaConvertCache = JSON.parse(data);
        const sizeInfo = fileName.replace(/.*\((.+)\).*/g, "$1");
        const size = sizeInfo.indexOf(".") === -1 ? sizeInfo.split("*") : [];
        switch (mediaInfo.type) {
          case MEDIA_TYPE.IMAGE:
            if (fileName.indexOf("_glass") !== -1) {
              decodedData.glassSize = size
            } else if (fileName.indexOf("_thumbnail") !== -1) {
              decodedData.thumbnailSize = size
            } else {
              decodedData.imageSize = size
            }
            break
          case MEDIA_TYPE.VIDEO:
            if (fileName.indexOf("_screenshot") !== -1) {
              decodedData.screenshotSize = size
            }
            break
        }
        if (decodedData.fileCount > 1) {
          decodedData.fileCount--;
          await redis.set(redisKey, JSON.stringify(decodedData));
        } else {
          const io = getSocketIO();
          let file = "";
          let size: any = {}
          switch (mediaInfo.type) {
            case MEDIA_TYPE.IMAGE:
              size = {thumbnail: decodedData.thumbnailSize, glass: decodedData.glassSize, image: decodedData.imageSize}
              file = decodedData.key.replace(config.AWS_MEDIA_CONVERT[mediaInfo.sourceFolder], "");
              break
            case MEDIA_TYPE.VIDEO:
              size = {screenshot: decodedData.screenshotSize, low: [540, 960], hd: [1080, 1920]}
              file = decodedData.key.replace(config.AWS_MEDIA_CONVERT[mediaInfo.sourceFolder], "")
              const tmp = getMediaUrl(mediaInfo.type, file, true, size) as VideoAmazonUrl;
              size.duration = await getVideoDurationInSeconds(tmp.low!);
          }
          const urls = getMediaUrl(mediaInfo.type, file, true, size) as ImageAmazonUrl | VideoAmazonUrl;
          const unPaymentUrls = getMediaUrl(mediaInfo.type, file, false, size) as ImageAmazonUrl | VideoAmazonUrl
          const msg = JSON.stringify({
            type: mediaInfo.type,
            key: decodedData.key,
            ...urls,
            fileName: file,
            owner: decodedData.owner,
            size
          });
          const unPaymentMsg = JSON.stringify({
            type: mediaInfo.type,
            key: decodedData.key,
            ...unPaymentUrls,
            fileName: file,
            owner: decodedData.owner,
            size
          });
          await mediaProducer.publish(msg);
          console.log("/mediaconvertcomplete/notification: decodedData.subscribers", decodedData.subscribers)
          if (decodedData.subscribers.length) {
            for (const uuid of decodedData.subscribers) {
              const sid = await getOnlineUser(uuid);
              console.log("/mediaconvertcomplete/notification: sid", sid)
              if (sid) {
                io.sockets.connected[sid].emit(SOCKET_CHANNEL.MEDIA_CONVERTED, uuid === decodedData.owner || decodedData.free? msg : unPaymentMsg);
              }
            }
          }
        }
      }
      ctx.body = jsonResponse();
    }
  }
  @POST("/paypal/success")
  async paypalSuccess(ctx: IRouterContext) {
    const headers = ctx.request.headers,
      body = ctx.request.body
    //验证webhook是否合法
    paypal.notification.webhookEvent.verify(headers, body, config.PAYPAL.paymentWebhookId, function (error, response) {
      if (error) {
        console.log(error.response.details);
        throw error;
      } else {
        // Verification status must be SUCCESS
        if (response.verification_status === "SUCCESS") {
          const paymentId = body.resource.parent_payment
        } else {
          console.error("It was a failed verification from", headers["x-real-ip"]);
        }
      }
    });
    ctx.body = jsonResponse(ctx.request)
  }
}
