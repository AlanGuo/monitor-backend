import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface Subscriber extends Document {
  from: number,
  media: string[],
  content?: string;
  deleted?: boolean;
}

const SubscriberModel: Schema = new Schema({
  uuid: {type: Number, required},
  subscribers: {type: Array(Number), required}
}, {
  timestamps: false
});

export default model<Subscriber>("subscriber", SubscriberModel);
