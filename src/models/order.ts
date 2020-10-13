import { Currency, OrderStatus, OrderType } from "@src/interface";
import {Schema, model, Document} from "mongoose";

const required = true;

export interface IOrder extends Document {
  uuid: number,
  type: OrderType,
  currency: string;
  amount: number;
  status: OrderStatus;
  method: string;
  orderId: string
  payAt?: Date;
  ip?: string;
}

const orderModel: Schema = new Schema({
  uuid: {type: Number, required},
  type: {type: OrderType, required},
  currency: {type: Currency, required, default: "usd"},
  amount: {type: Number, required, default: 0},
  ip: {type: String, required: false},
  payAt: {type: Date, required: false},
  method: {type: String, required},
  orderId: {type: String, required: false},
  status: {type: OrderStatus, default: 0}
}, {
  timestamps: true
});

orderModel.index({orderId: 1}, {unique: true});

export default model<IOrder>("order", orderModel);
