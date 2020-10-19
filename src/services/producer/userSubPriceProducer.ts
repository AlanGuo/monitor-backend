import config from "@src/infrastructure/utils/config";
import {Producer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  USER_SUB_PRICE_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE
} from "@src/infrastructure/utils/constants";

export let userSubPriceProducer: Producer;

export async function loadUserSubPriceProducer() {
  userSubPriceProducer = new Producer(USER_SUB_PRICE_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await userSubPriceProducer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);
}

