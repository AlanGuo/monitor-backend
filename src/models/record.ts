import {Schema, Document} from "mongoose";
import { arbitrageDBConn } from "@src/infrastructure/mongo";

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
  long_final_price: number,
  short_final_price: number,
  long_open_volume: number;
  short_open_volume: number;
  long_final_volume: number;
  short_final_volume: number;
  volume_precision: number;
  long_price_precision: number;
  short_price_precision: number;
  long_price_tick: number;
  short_price_tick: number;
  price_precision: number;
  long_open_balance: number;
  short_open_balance: number;
  long_close_balance: number;
  short_close_balance: number;
  long_transfer_vec: number[];
  short_transfer_vec: number[];
  price_diff_profit: number;
  best_close_price_diff: number;
  target_open_price_diff: number;
  long_index_price: number;
  short_index_price: number;
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
  status: {type: String, required},
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
  long_price_precision: {type: Number, required},
  short_price_precision: {type: Number, required},
  long_price_tick: {type: Number, required},
  short_price_tick: {type: Number, required},
  long_open_balance: {type: Number, required},
  short_open_balance: {type: Number, required},
  long_open_price: {type: Number, required},
  short_open_price: {type: Number, required},
  long_close_balance: {type: Number, required},
  short_close_balance: {type: Number, required},
  long_transfer_vec:{type: Array, required},
  short_transfer_vec: {type: Array, required},
  best_close_price_diff:{type: Number, required},
  target_open_price_diff:{type: Number, required},
  fulfillment_lost: {type: Number, required},
  profit: {type: Number, required},
  usdt_fee: {type: Number, required},
  bnb_fee: {type: Number, required},
  long_index_price: {type: Number, required},
  short_index_price: {type: Number, required},
  long_balance: {type: Number, required},
  short_balance: {type: Number, required}
}, {
  timestamps: false
});

export default arbitrageDBConn.model<IRecord>("record", recordModel);
