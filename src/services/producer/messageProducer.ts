import config from "@src/infrastructure/utils/config";
import {Producer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  MESSAGE_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE
} from "@src/infrastructure/utils/constants";

export let messageProducer: Producer;

export async function loadMessageProducer() {
  messageProducer = new Producer(MESSAGE_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await messageProducer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);
}

