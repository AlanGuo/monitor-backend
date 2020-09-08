import config from "@src/infrastructure/utils/config";
import {Consumer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  MESSAGE_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE, UPDATE_DIALOGUE_QUEUE,
} from "@src/infrastructure/utils/constants";
import DialogueModel from "@src/models/dialogue"

export async function loadUpdateDialogueConsumer() {

  const consumer = new Consumer(UPDATE_DIALOGUE_QUEUE, MESSAGE_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await consumer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  await consumer.consume(async msg => {
    const tmp = JSON.parse(msg);
    console.log('update dialogue:', msg)

    await DialogueModel.updateOne(
      {from: tmp.from, to: tmp.to},
      {
        $setOnInsert: {
          from: tmp.from,
          to: tmp.to,
          timeline: 0
        },
        $set: {
          show: true
        }
      },
      {upsert: true}
    );

    await DialogueModel.updateOne(
      {from: tmp.to, to: tmp.from},
      {
        $setOnInsert: {
          from: tmp.to,
          to: tmp.from,
          timeline: 0
        },
        $set: {
          show: true
        }
      },
      {upsert: true}
    );
  })
}
