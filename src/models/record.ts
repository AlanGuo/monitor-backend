import {Schema, model, Document} from "mongoose";

const required = true;

export interface IRecord extends Document {
  first_settle_time: string,
  next_settle_time: string,
  hold: boolean,
  refill: boolean,
  symbol: string,
  longex: string;
  shortex: string;
  max_volume: number;
  min_volume: number;
  price: number;
  long_funding_rate: number;
  long_funding_rate_next: number;
  short_funding_rate: number;
  short_funding_rate_next: number;
  long_final_price: number;
  short_final_price: number;
  long_open_price: number;
  short_open_price: number;
  long_open_volume: number;
  short_open_volume: number;
  long_final_volume: number;
  short_final_volume: number;
  volume_precision: number;
  price_precision: number;
  long_open_balance: number;
  short_open_balance: number;
  long_close_balance: number;
  short_close_balance: number;
  profit: number;
}

const recordModel: Schema = new Schema({
  first_settle_time: {type: Date, required},
  next_settle_time: {type: Date, required},
  symbol: {type: String, required},
  hold: {type: Boolean, required},
  refill: {type: Boolean, required},
  longex: {type: String, required},
  shortex: {type: String, required},
  max_volume: {type: Number, required},
  min_volume: {type: Number, required},
  price:{type: Number, required},
  long_funding_rate: {type: Number, required},
  long_funding_rate_next:{type: Number, required},
  short_funding_rate:{type: Number, required},
  short_funding_rate_next: {type: Number, required},
  long_open_volume: {type: Number, required},
  short_open_volume: {type: Number, required},
  long_final_volume: {type: Number, required},
  short_final_volume: {type: Number, required},
  volume_precision: {type: Number, required},
  price_precision: {type: Number, required},
  long_open_balance: {type: Number, required},
  short_open_balance: {type: Number, required},
  long_open_price: {type: Number, required},
  short_open_price:{type: Number, required},
  long_final_price: {type: Number, required},
  short_final_price: {type: Number, required},
  long_close_balance: {type: Number, required},
  short_close_balance: {type: Number, required},
  profit: {type: Number, required},
}, {
  timestamps: false
});

export default model<IRecord>("record", recordModel);
