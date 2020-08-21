// @ts-ignore
import config from "config"
import {Producer, Consumer} from "../src/infrastructure/rabbitMq";
import {sleep} from "../src/infrastructure/utils";


describe("rabbitmq", () => {

  const queueName = "hffp";
  const queueName2 = "hffp2";
  const queueName3 = "hffp3";

  const exchangeName = "testExchange";
  const routingKey = "test";
  const routingKey2 = "test2";


  const producer = new Producer(routingKey, exchangeName);
  const consume = new Consumer(queueName, routingKey, exchangeName);
  const consume2 = new Consumer(queueName2, routingKey2, exchangeName);
  const consume3 = new Consumer(queueName3, routingKey, exchangeName);


  beforeAll(async () => {
    await producer.connection(config.RABBITMQ);
    await consume.connection(config.RABBITMQ);
    await consume2.connection(config.RABBITMQ);
    await consume3.connection(config.RABBITMQ);
  });

  afterAll(async () => {
    await producer.close();
    await consume.close();
    await consume2.close();
    await consume3.close();

  });

  test("publish", async () => {
    let tmp = 0;
    let tmp2 = 0;
    let tmp3 = 0;
    await consume.consume(async (msg) => {
      console.log(msg);
      tmp += 1;
    });
    await consume2.consume(async (msg) => {
      console.log(msg);
      tmp2 += 1;
    });
    await consume3.consume(async (msg) => {
      console.log(msg);
      tmp3 += 1;
    });

    await producer.publish("test msg 1");
    await sleep(2000);
    await producer.publish("test msg 2");
    await sleep(1000);
    expect(tmp).toBe(2);
    expect(tmp2).toBe(0);
    expect(tmp3).toBe(2);

  },)
});

