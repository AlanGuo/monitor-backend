import config from "@src/infrastructure/utils/config";
import {Consumer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  NOTIFICATION_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE,
  SAVE_NOTIFICATION_QUEUE,

} from "@src/infrastructure/utils/constants";
import NotificationModel from "@src/models/notification";

export async function loadSaveNotificationConsume() {
  const consumer = new Consumer(SAVE_NOTIFICATION_QUEUE, NOTIFICATION_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await consumer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  await consumer.consume(async msg => {
    const tmp = JSON.parse(msg);
    console.log('save notification:', msg);
  })
}