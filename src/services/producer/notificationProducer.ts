import config from "@src/infrastructure/utils/config";
import {Producer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  NOTIFICATION_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE
} from "@src/infrastructure/utils/constants";

export let notificationProducer: Producer;

export async function loadNotificationProducer() {
  notificationProducer = new Producer(NOTIFICATION_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await notificationProducer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);
}

