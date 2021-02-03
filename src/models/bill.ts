import {Schema, model, Types, Document} from "mongoose";
import {BillType, ConsumeType} from "@src/infrastructure/utils/constants";
import BigNumber from "bignumber.js";

const required = true;
const sparse = true;

//账单
export interface IBill extends Document {
  uuid: number,
  type: BillType,
  amount: BigNumber,
  commissionAmount: BigNumber,
  totalAmount: BigNumber,
  target?: number,
  consumeType?: ConsumeType,
  consumeId?: Types.ObjectId,
  rechargeId?: string,
  createdAt?: Date,
  from?: number
}

const BillModel: Schema = new Schema({
  uuid: {type: Number, required},
  type: {type: BillType, required},
  amount: {type: String, required},
  commissionAmount: {type: String, required, default: 0},
  totalAmount: {type: String, required},
  target: {type: Number, required: false, sparse},
  consumeType: {type: ConsumeType, required: false},
  consumeId: {type: Types.ObjectId, required: false},
  rechargeId: {type: String, required: false},
  from: {type: Number, required: false} // type=invite 来自谁
}, {
  timestamps: true
});

BillModel.index({uuid: 1})
BillModel.index({target: 1})

export default model<IBill>("bill", BillModel);
