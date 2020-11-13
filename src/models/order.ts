import {Schema, model, Document} from "mongoose";
import {Currency, OrderStatus, OrderType} from "@src/infrastructure/utils/constants";

const required = true;

export interface IOrder extends Document {
  uuid: number,
  type: OrderType,
  currency: string;
  amount: number;
  status: OrderStatus;
  method: string;
  orderId: string;
  payerId?: string;
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
  payerId: {type: String, required: false},
  orderId: {type: String, required},
  status: {type: OrderStatus, default: 0}
}, {
  timestamps: true
});

orderModel.index({orderId: 1}, {unique: true});

export default model<IOrder>("order", orderModel);
