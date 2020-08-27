// @ts-ignore
import config from "config"
import {Consumer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  MESSAGE_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE,
  SEND_MESSAGE_QUEUE, SOCKET_CHANNEL
} from "@src/infrastructure/utils/constants";
import { getSocketIO } from "@src/infrastructure/socket";
import { getOnlineUser, redis } from "@src/infrastructure/redis";
import { isVideo } from "@src/infrastructure/utils/video";
import { isImage } from "@src/infrastructure/utils/image";

export async function loadSendMessageConsumer() {
  const io = getSocketIO();

  const consumer = new Consumer(SEND_MESSAGE_QUEUE, MESSAGE_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await consumer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  await consumer.consume(async msg => {
    let jsonMsg = JSON.parse(msg);
    console.log("send:", jsonMsg)
    const toSid = await getOnlineUser(jsonMsg.to);
    // 判断消息中的媒体类型是否转换完成
    for(let m of jsonMsg.media) {
      if (!m.ready) {
        // 媒体未完成转换
        const ext = m.key.split(".")[1];
        let type = "", confKey = "";
        if (isVideo(ext)) {
          type = "Video";
          confKey = m.purpose + type + "Folder";
        } else if (isImage(ext)) {
          type = "Image";
          confKey = "imageFolder";
        }
        const fileNameWithoutExt = m.key.split(".")[0].replace(config.AWS_MEDIA_CONVERT[type.toLowerCase() + "SourceFolder"], "");
        const data = await redis.get(config.AWS_MEDIA_CONVERT[confKey] + fileNameWithoutExt);
        if (data) {
          const decodedData = JSON.parse(data);
          decodedData.subscribers.push(toSid);
          await redis.set(config.AWS_MEDIA_CONVERT[confKey] + fileNameWithoutExt, JSON.stringify(decodedData));
        }
      }
    }
    if (toSid) {
      io.sockets.connected[toSid].emit(SOCKET_CHANNEL.CHAT_MESSAGE, msg)
    }
  })
}
