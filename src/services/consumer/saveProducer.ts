// @ts-ignore
import config from "config"
import {Consumer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE, MEDIA_ROUTING_KEY, MEDIA_TYPE,
  RABBITMQ_EXCHANGE_TYPE, SAVE_MEDIA_QUEUE
} from "@src/infrastructure/utils/constants";
import MediaModel from "@src/models/media"

export async function loadSaveProducerConsumer() {

  const consumer = new Consumer(SAVE_MEDIA_QUEUE, MEDIA_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await consumer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  await consumer.consume(async msg => {
    let tmp = JSON.parse(msg);
    console.log('save producer:', msg);
    const fileName = tmp.fileName.split(".");
    await MediaModel.create({
      type: fileName.length > 1 ? MEDIA_TYPE.IMAGE : MEDIA_TYPE.VIDEO,
      owner: tmp.owner,
      fileName: tmp.fileName[0]
    })

  })
}
