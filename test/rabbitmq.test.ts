// @ts-ignore
import config from "config"
import {Producer} from "../src/infrastructure/rabbitMq/producer";
import {Consumer} from "../src/infrastructure/rabbitMq/consumer";
import {sleep} from "../src/infrastructure/utils";


describe("rabbitmq", () => {

  const queueName = "hffp";
  const queueName2 = "hffp2";

  const exchangeName = 'testExchange';
  const routingKey = "test";
  const routingKey2 = "test2";


  const producer = new Producer(routingKey, exchangeName);
  const consume = new Consumer(queueName, routingKey, exchangeName);
  const consume2 = new Consumer(queueName2, routingKey2, exchangeName);


  beforeAll(async () => {
    await producer.connection(config.RABBITMQ);
    await consume.connection(config.RABBITMQ);
    await consume2.connection(config.RABBITMQ);

  });

  afterAll(async () => {
    await producer.close();
    await consume.close();
    await consume2.close();

  });

  test("publish", async () => {
    let tmp = 0;
    let tmp2 = 0;
    await consume.consume((msg) => {
      console.log(msg);
      tmp += 1;
    });
    await consume2.consume((msg) => {
      console.log(msg);
      tmp2 += 1;
    });

    await producer.publish("test msg 1");
    await sleep(2000);
    await producer.publish("test msg 2");
    await sleep(1000);
    expect(tmp).toBe(2);
    expect(tmp2).toBe(0)

  },)
});

