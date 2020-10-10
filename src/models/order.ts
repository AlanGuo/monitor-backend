import { Currency, OrderStatus, OrderType } from "@src/interface";
import {Schema, model, Document} from "mongoose";

const required = true;

export interface IOrder extends Document {
  uuid: Number,
  type: OrderType,
  currency: String;
  amount: Number;
  status: OrderStatus;
  payAt?: Date;
  paymentId?: String;
  ip?: String;
}

const orderModel: Schema = new Schema({
  uuid: {type: Number, required},
  type: {type: OrderType, required},
  currency: {type: Currency, required, default: "usd"},
  amount: {type: Number, required, default: 0},
  ip: {type: String, required: false},
  payAt: {type: Date, required: false},
  paymentId: {type: String, required: false},
  status: {type: OrderStatus, default: 0}
}, {
  timestamps: true
});

export default model<IOrder>("order", orderModel);
