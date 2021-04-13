import {Schema, model, Document} from "mongoose";

const required = true;

export interface IFulfillment extends Document {
  task_id: Schema.Types.ObjectId,
  datetime: string,
  exchange: string,
  symbol: string,
  order_id: string;
  side: string;
  position: number;
  price: number;
  volume: number;
  fill: number;
}

const fulfillmentModel: Schema = new Schema({
  task_id: {type: Schema.Types.ObjectId, required},
  datetime: {type: Date, required},
  symbol: {type: String, required},
  exchange: {type: String, required},
  order_id: {type: String, required},
  side: {type: String, required},
  position: {type: Number, required},
  price:{type: Number, required},
  volume:{type: Number, required},
  fill: {type: Number, required}
}, {
  timestamps: false
});

export default model<IFulfillment>("fulfillment", fulfillmentModel);
