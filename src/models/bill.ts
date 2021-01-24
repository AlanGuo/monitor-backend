import {Schema, model, Types, Document} from "mongoose";
import {BillType, ConsumeType} from "@src/infrastructure/utils/constants";

const required = true;
const sparse = true;

//账单
export interface IBill extends Document {
  uuid: number,
  type: BillType,
  amount: number,
  commissionAmount: number,
  totalAmount: number,
  target?: number,
  consumeType?: ConsumeType,
  consumeId?: Types.ObjectId,
  rechargeId?: string,
  createdAt?: Date,
}

const BillModel: Schema = new Schema({
  uuid: {type: Number, required},
  type: {type: BillType, required},
  amount: {type: Number, required},
  commissionAmount: {type: Number, required, default: 0},
  totalAmount: {type: Number, required},
  target: {type: Number, required: false, sparse},
  consumeType: {type: ConsumeType, required: false},
  consumeId: {type: Types.ObjectId, required: false},
  rechargeId: {type: String, required: false}
}, {
  timestamps: true
});

BillModel.index({uuid: 1})
BillModel.index({target: 1})

export default model<IBill>("bill", BillModel);
