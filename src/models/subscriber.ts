import {Schema, model, Document} from "mongoose";

const required = true;

export interface Subscriber extends Document {
  uuid: number,
  target: number
  createAt: number,
  expireAt: number,
  reBill?: boolean
}

const SubscriberModel: Schema = new Schema({
  uuid: {type: Number, required},
  // 订阅谁
  target: {type: Number, required},
  createAt: {type: Number, required},
  expireAt: {type: Number, required},
  reBill: {type: Boolean, required, default: true}
}, {
  timestamps: false
});

export default model<Subscriber>("subscriber", SubscriberModel);
