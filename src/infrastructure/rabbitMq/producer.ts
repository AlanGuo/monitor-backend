import {Connection, connect, Channel, Options} from "amqplib"
import {RABBITMQ_EXCHANGE_TYPE} from "../utils/constants";

export class Producer {
  connect?: Connection;
  channel?: Channel;
  routingKey: string;
  exchangeName: string;

  constructor(routingKey: string, exchangeName: string) {
    this.routingKey = routingKey;
    this.exchangeName = exchangeName;
  }

  async connection(url: string, exchangeType?: RABBITMQ_EXCHANGE_TYPE, options?: Options.AssertExchange) {
    // new connection
    this.connect = await connect(url);
    // new channel
    this.channel = await this.connect.createChannel();
    // defined exchange
    await this.channel.assertExchange(this.exchangeName, exchangeType || RABBITMQ_EXCHANGE_TYPE.DIRECT, options);
  }

  async publish(msg: string) {
    await this.channel!.publish(this.exchangeName, this.routingKey, Buffer.from(msg))
  }

  async close() {
    await this.channel!.close();
    await this.connect!.close();
  }
}

