// @ts-ignore
import config from "config"
import {Producer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  MEDIA_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE
} from "@src/infrastructure/utils/constants";

export let mediaProducer: Producer;

export async function loadMediaProducer() {
  mediaProducer = new Producer(MEDIA_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await mediaProducer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);
}

