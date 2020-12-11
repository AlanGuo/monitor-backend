import {Consumer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  UPDATE_USER_SUB_PRICE_QUEUE,
  USER_SUB_PRICE_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE
} from "@src/infrastructure/utils/constants";
import config from "@src/infrastructure/utils/config";
import DialogueModel from "@src/models/dialogue";

export async function loadUpdateUserChatPriceConsumer() {
  const consumer = new Consumer(UPDATE_USER_SUB_PRICE_QUEUE, USER_SUB_PRICE_ROUTING_KEY, JUSTFANS_EXCHANGE)
  await consumer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  await consumer.consume(async msg => {
    const tmp = JSON.parse(msg)
    if (tmp.chatPrice > 0) {
      await DialogueModel.updateMany({to: tmp.uuid, talkExpireTime: 0}, {$set: {talkExpireTime: tmp.chatPrice > 0 ? 0: -1}})
    }
  })
}
