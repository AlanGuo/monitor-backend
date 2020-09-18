import config from "@src/infrastructure/utils/config";
import {Consumer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  MEDIA_TYPE,
  MESSAGE_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE,
  SEND_MESSAGE_QUEUE,
  SOCKET_CHANNEL
} from "@src/infrastructure/utils/constants";
import {getSocketIO} from "@src/infrastructure/socket";
import {getOnlineUser, redis} from "@src/infrastructure/redis";
import {getMediaUrl} from "@src/infrastructure/amazon/mediaConvert";
import {mediaType} from "@src/infrastructure/utils";


export async function loadSendMessageConsumer() {
  const io = getSocketIO();

  const consumer = new Consumer(SEND_MESSAGE_QUEUE, MESSAGE_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await consumer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  await consumer.consume(async msg => {
    const jsonMsg = JSON.parse(msg);
    console.log("send message:", jsonMsg);
    const toSid = await getOnlineUser(jsonMsg.to);
    // 判断消息中的媒体类型是否转换完成
    for (const m of jsonMsg.media) {
      if (!m.ready) {
        // 媒体未完成转换
        const ext = m.key.split(".")[1];
        const mediaInfo = mediaType(ext)
        const fileNameWithoutExt = m.key.split(".")[0].replace(config.AWS_MEDIA_CONVERT[mediaInfo.sourceFolder], "");
        const data = await redis.get(config.AWS_MEDIA_CONVERT[mediaInfo.confKey] + fileNameWithoutExt);
        if (data) {
          const decodedData = JSON.parse(data);
          decodedData.subscribers.push(jsonMsg.to);
          console.log('add subscribers', jsonMsg.to);
          await redis.set(config.AWS_MEDIA_CONVERT[mediaInfo.confKey] + fileNameWithoutExt, JSON.stringify(decodedData));
        } else {
          jsonMsg.media.forEach((media: { key: string, type: string, ready: boolean, urls: any }) => {
            media.ready = true;
            switch (media.type) {
              case MEDIA_TYPE.IMAGE:
                media.urls = getMediaUrl(MEDIA_TYPE.IMAGE, media.key.split("/")[1]);
                break;
              case MEDIA_TYPE.VIDEO:
                media.urls = getMediaUrl(MEDIA_TYPE.VIDEO, media.key.split("/")[1].split(".")[0]);
            }
          })
        }
      }
    }
    if (toSid) {
      io.sockets.connected[toSid].emit(SOCKET_CHANNEL.CHAT_MESSAGE, JSON.stringify(jsonMsg))
    }
  })
}
