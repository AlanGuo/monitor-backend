import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface IDepth extends Document {
  symbol: string,
  ts: number;
  binance_ask: number;
  binance_bid: number;
  bybit_ask: number;
  bybit_bid: number;
  okex_ask: number;
  okex_bid: number;
}

const depthModel: Schema = new Schema({
  symbol: {type: String, required},
  ts: {type: Number, required},
  binance_ask: {type: Number},
  binance_bid: {type: Number},
  bybit_ask: {type: Number},
  bybit_bid: {type: Number},
  okex_ask: {type: Number},
  okex_bid: {type: Number},
}, {
  timestamps: false
});

export default model<IDepth>("depth", depthModel);
