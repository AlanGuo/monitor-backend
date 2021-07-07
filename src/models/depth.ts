import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface IDepth extends Document {
  symbol: string,
  ts: number;
  binance_ask: number;
  binance_bid: string;
  huobi_ask: number;
  huobi_bid: string;
  okex_ask: number;
  okex_bid: string;
}

const depthModel: Schema = new Schema({
  symbol: {type: String, required},
  ts: {type: Number, required},
  binance_ask: {type: Number},
  binance_bid: {type: String},
  huobi_ask: {type: Number},
  huobi_bid: {type: String},
  okex_ask: {type: Number},
  okex_bid: {type: String},
}, {
  timestamps: false
});

export default model<IDepth>("depth", depthModel);
