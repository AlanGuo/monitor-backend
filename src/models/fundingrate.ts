import {Schema, Document} from "mongoose";
import { loanDBConn } from "@src/infrastructure/mongo";

const required = true;

export interface IFundingRate extends Document {
  symbol: string,
  currency: string,
  ts: number;
  datetime: number;
  funding_rate: number;
  next_funding_rate: number;
}

const fundingRateModel: Schema = new Schema({
  symbol: {type: String, required},
  currency: {type: String, required},
  ts: {type: Number, required},
  datetime: {type: Number, required},
  funding_rate: {type: Number, required},
  next_funding_rate: {type: Number, required},
}, {
  timestamps: false
});

export default loanDBConn.model<IFundingRate>("fundingrate", fundingRateModel);
