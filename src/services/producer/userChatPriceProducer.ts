import config from "@src/infrastructure/utils/config";
import {Producer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  USER_SUB_PRICE_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE
} from "@src/infrastructure/utils/constants";

export let userChatPriceProducer: Producer;

export async function loadUserChatPriceProducer() {
  userChatPriceProducer = new Producer(USER_SUB_PRICE_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await userChatPriceProducer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);
}

