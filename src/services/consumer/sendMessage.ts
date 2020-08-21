// @ts-ignore
import config from "config"
import {Consumer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  MESSAGE_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE,
  SEND_MESSAGE_QUEUE, SOCKET_CHANNEL
} from "@src/infrastructure/utils/constants";
import {getSocketIO} from "@src/infrastructure/socket";
import {getOnlineUser} from "@src/infrastructure/redis";

export async function loadSendMessageConsumer() {
  const io = getSocketIO();

  const consumer = new Consumer(SEND_MESSAGE_QUEUE, MESSAGE_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await consumer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  await consumer.consume(async msg => {
    let tmp = JSON.parse(msg);
    console.log('send:', msg)
    const toSid = await getOnlineUser(tmp.to);
    const fromSid = await getOnlineUser(tmp.from);
    if (toSid) {
      io.sockets.connected[toSid].emit(SOCKET_CHANNEL.CHAT_MESSAGE, msg)
    }
    if (fromSid) {
      io.sockets.connected[fromSid].emit(SOCKET_CHANNEL.CHAT_MESSAGE, msg)
    }
  })
}
