import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface Subscriber extends Document {
  uuid: number,
  target: number
}

const SubscriberModel: Schema = new Schema({
  uuid: {type: Number, required},
  // 订阅谁
  target: {type: Number, required}
}, {
  timestamps: false
});

export default model<Subscriber>("subscriber", SubscriberModel);
