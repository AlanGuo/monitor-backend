import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface IFulfillment extends Document {
  task_id: Types.ObjectId,
  datetime: string,
  exchange: string,
  symbol: string,
  order_id: string;
  side: string;
  position: string;
  price: number;
  volume: number;
  fill: number;
  fee: number;
  fee_asset: number;
}

const fulfillmentModel: Schema = new Schema({
  task_id: {type: Types.ObjectId, required},
  datetime: {type: Date, required},
  symbol: {type: String, required},
  exchange: {type: String, required},
  order_id: {type: String, required},
  side: {type: String, required},
  position: {type: String, required},
  price:{type: Number, required},
  volume:{type: Number, required},
  fill: {type: Number, required},
  fee: {type: Number, required},
  fee_asset: {type: Number, required}
}, {
  timestamps: false
});

export default model<IFulfillment>("fulfillment", fulfillmentModel);
