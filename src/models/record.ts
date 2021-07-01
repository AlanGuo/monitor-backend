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
  long_bid_price: number;
  long_ask_price: number;
  short_bid_price: number;
  short_ask_price: number;
  long_vol_ratio: number;
  short_vol_ratio: number;
  long_funding_fee: number[];
  short_funding_fee: number[];
  long_funding_rate: number;
  long_funding_rate_next: number;
  short_funding_rate: number;
  short_funding_rate_next: number;
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
  long_transfer_balance: number;
  short_transfer_balance: number;
  price_diff_profit: number;
  long_index_price: number;
  short_index_price: number;
  task_index_price: number;
  long_balance: number;
  short_balance: number;
  profit: number;
  usdt_fee: number;
  bnb_fee: number;
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
  long_bid_price:{type: Number, required},
  long_ask_price:{type: Number, required},
  short_bid_price:{type: Number, required},
  short_ask_price:{type: Number, required},
  long_vol_ratio: {type: Number, required},
  short_vol_ratio: {type: Number, required},
  long_funding_fee: {type: Array, required},
  short_funding_fee: {type: Array, required},
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
  short_open_price: {type: Number, required},
  long_close_balance: {type: Number, required},
  short_close_balance: {type: Number, required},
  long_transfer_balance:{type: Number, required},
  short_transfer_balance: {type: Number, required},
  fulfillment_lost: {type: Number, required},
  profit: {type: Number, required},
  usdt_fee: {type: Number, required},
  bnb_fee: {type: Number, required},
  long_index_price: {type: Number, required},
  short_index_price: {type: Number, required},
  task_index_price: {type: Number, required},
  long_balance: {type: Number, required},
  short_balance: {type: Number, required}
}, {
  timestamps: false
});

export default model<IRecord>("record", recordModel);
