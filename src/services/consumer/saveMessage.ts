// @ts-ignore
import config from "config"
import {Consumer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  MESSAGE_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE, SAVE_MESSAGE_QUEUE,
} from "@src/infrastructure/utils/constants";
import MessageModel from "@src/models/message"

export async function loadSaveMessageConsumer() {

  const consumer = new Consumer(SAVE_MESSAGE_QUEUE, MESSAGE_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await consumer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  await consumer.consume(async msg => {
    let tmp = JSON.parse(msg);
    console.log('save:', msg)
    await MessageModel.create({
      from: tmp.from,
      to: tmp.to,
      content: tmp.text,
    })
  })
}
