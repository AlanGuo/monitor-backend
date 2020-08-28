// @ts-ignore
import config from "config"
import {Consumer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE, MEDIA_TYPE,
  MESSAGE_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE, SAVE_MESSAGE_QUEUE,
} from "@src/infrastructure/utils/constants";
import MessageModel from "@src/models/message"
import MediaModel from "@src/models/media"
import {Types} from "mongoose";


export async function loadSaveMessageConsumer() {

  const consumer = new Consumer(SAVE_MESSAGE_QUEUE, MESSAGE_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await consumer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  await consumer.consume(async msg => {
    let tmp = JSON.parse(msg);
    console.log('save message:', msg);
    const media: string[] = await Promise.all(tmp.media.map((item: any) => {
      if (item.key) {
        return item.type === MEDIA_TYPE.VIDEO ? item.key.split("/")[1].split('.')[0] : item.key.split("/")[1]
      }
      return item.fileName;
    }));

    await MessageModel.create({
      from: tmp.from,
      to: tmp.to,
      content: tmp.content,
      media: media
    })
  })
}
