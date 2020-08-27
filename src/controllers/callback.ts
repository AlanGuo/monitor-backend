// @ts-ignore
import config from "config";
import {Controller, POST} from "@src/infrastructure/decorators/koa";
import {IRouterContext} from "koa-router";
import {getOnlineUser, redis} from "@src/infrastructure/redis";
import {getSocketIO} from "@src/infrastructure/socket";
import {MEDIA_PURPOSE, MEDIA_TYPE, SOCKET_CHANNEL} from "@src/infrastructure/utils/constants";
import {jsonResponse} from "@src/infrastructure/utils/helper";
import {isImage} from "@src/infrastructure/utils/image";
import {isVideo} from "@src/infrastructure/utils/video";
import {mediaProducer} from "@src/services/producer/mediaProducer";
import {getMediaUrl} from "@src/infrastructure/amazon/mediaConvert";
import {ImageAmazonUrl, VideoAmazonUrl} from "@src/interface";


// todo: need to verity the signatures of Amazon SNS messages
@Controller({prefix: "/callback"})
export default class CallbackController {
  @POST("/mediaconvertcomplete/notification")
  async notify(ctx: IRouterContext) {
    const body = ctx.request.body;
    const message = JSON.parse(body.Message);
    const records = message.Records;
    for (let recordItem of records) {
      const fileName = recordItem.s3.object.key;
      const ext = fileName.split(".")[1];
      let redisKey = fileName.split(".")[0];
      // 视频文件有下划线分割"_"，这里把下划线也滤除
      redisKey = redisKey.split("_")[0];
      const data = await redis.get(redisKey);
      // console.log("redisKey", redisKey, data);
      if (data) {
        const decodedData = JSON.parse(data);
        if (decodedData.fileCount > 1) {
          decodedData.fileCount--;
          await redis.set(redisKey, JSON.stringify(decodedData));
        } else {
          // all files have been converted successfully
          if (decodedData.subscribers.length) {
            const io = getSocketIO();
            if (isImage(ext)) {
              const fileName = decodedData.key.replace(config.AWS_MEDIA_CONVERT.imageSourceFolder, "");
              await redis.del(redisKey);
              const urls = (getMediaUrl(MEDIA_TYPE.IMAGE, fileName) as ImageAmazonUrl);
              for (let uuid of decodedData.subscribers) {
                const msg = JSON.stringify({
                  type: MEDIA_TYPE.IMAGE,
                  key: decodedData.key,
                  ...urls,
                  fileName,
                  owner: uuid
                });
                await mediaProducer.publish(msg);
                const sid = await getOnlineUser(uuid);
                if (sid) {
                  io.sockets.connected[sid].emit(SOCKET_CHANNEL.MEDIA_CONVERTED, msg);
                }
              }
            } else if (isVideo(ext)) {
              const fileNameWithoutExt = decodedData.key.split(".")[0].replace(config.AWS_MEDIA_CONVERT.videoSourceFolder, "");
              await redis.del(redisKey);
              for (let uuid of decodedData.subscribers) {
                const urls = getMediaUrl(MEDIA_TYPE.VIDEO, fileNameWithoutExt, MEDIA_PURPOSE.CHAT) as VideoAmazonUrl;
                const msg = JSON.stringify({
                  type: MEDIA_TYPE.VIDEO,
                  key: decodedData.key,
                  ...urls,
                  fileName: fileNameWithoutExt,
                  owner: uuid
                });
                await mediaProducer.publish(msg);
                const sid = await getOnlineUser(uuid);
                if (sid) {
                  io.sockets.connected[sid].emit(SOCKET_CHANNEL.MEDIA_CONVERTED, msg);
                }
              }
            }
          }
        }
      }
      ctx.body = jsonResponse();
    }
  }
}
