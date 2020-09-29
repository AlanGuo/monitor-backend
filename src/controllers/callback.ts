import config from "@src/infrastructure/utils/config";
import {Controller, POST} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import {getOnlineUser, redis} from "@src/infrastructure/redis";
import {getSocketIO} from "@src/infrastructure/socket";
import {MEDIA_TYPE, SOCKET_CHANNEL} from "@src/infrastructure/utils/constants";
import {jsonResponse} from "@src/infrastructure/utils/helper";
import {isImage} from "@src/infrastructure/utils/image";
import {isVideo} from "@src/infrastructure/utils/video";
import {mediaProducer} from "@src/services/producer/mediaProducer";
import {getMediaUrl} from "@src/infrastructure/amazon/mediaConvert";
import {ImageAmazonUrl, MediaConvertCache, VideoAmazonUrl} from "@src/interface";
import {mediaType} from "@src/infrastructure/utils";


// todo: need to verity the signatures of Amazon SNS messages
@Controller({prefix: "/callback"})
export default class CallbackController {
  @POST("/mediaconvertcomplete/notification")
  async notify(ctx: IRouterContext) {
    const body = ctx.request.body;
    const message = JSON.parse(body.Message);
    const records = message.Records;
    for (const recordItem of records) {
      const fileName: string = recordItem.s3.object.key;
      const ext = fileName.split(".")[1];
      let redisKey = fileName.split(".")[0];
      // 视频文件有下划线分割"_"，这里把下划线也滤除
      // 图片文件分 glass, thumbnail 有下划线
      redisKey = redisKey.split("_")[0];
      const data = await redis.get(redisKey);
      const mediaInfo = mediaType(ext)
      if (data) {
        const decodedData: MediaConvertCache = JSON.parse(data);
        if (decodedData.fileCount > 1) {
          switch (mediaInfo.type) {
            case MEDIA_TYPE.IMAGE:
              const sizeInfo = fileName.replace(/.*\((.+)\).*/g, "$1");
              const size = sizeInfo.indexOf(".") === -1 ? sizeInfo.split("*") : [];
              if (fileName.indexOf("_glass") !== -1) {
                decodedData.glassSize = size
              } else if (fileName.indexOf("_thumbnail") !== -1) {
                decodedData.thumbnailSize = size
              } else {
                decodedData.imageSize = size
              }
              break
            case MEDIA_TYPE.VIDEO:
              break
          }
          decodedData.fileCount--;
          await redis.set(redisKey, JSON.stringify(decodedData));
        } else {
          const io = getSocketIO();
          let file = "";
          let size = {}
          switch (mediaInfo.type) {
            case MEDIA_TYPE.IMAGE:
              size = {thumbnail: decodedData.thumbnailSize, glass: decodedData.glassSize, image: decodedData.imageSize}
              file = decodedData.key.replace(config.AWS_MEDIA_CONVERT[mediaInfo.sourceFolder], "");
              break
            case MEDIA_TYPE.VIDEO:
              size = {screenshot: [540, 960], low: [540, 960], hd: [1080, 1920]}
              file = decodedData.key.split(".")[0].replace(config.AWS_MEDIA_CONVERT[mediaInfo.sourceFolder], "")
          }
          await redis.del(redisKey);
          const urls = getMediaUrl(mediaInfo.type, file) as ImageAmazonUrl | VideoAmazonUrl;
          const unPaymentUrls = getMediaUrl(mediaInfo.type, file, false) as ImageAmazonUrl | VideoAmazonUrl
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

          if (decodedData.subscribers.length) {
            for (const uuid of decodedData.subscribers) {
              const sid = await getOnlineUser(uuid);
              if (sid) {
                io.sockets.connected[sid].emit(SOCKET_CHANNEL.MEDIA_CONVERTED, uuid === decodedData.owner ? msg : unPaymentMsg);
              }
            }
          }
        }
      }
      ctx.body = jsonResponse();
    }
  }
}
