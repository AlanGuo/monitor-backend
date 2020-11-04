import {Schema, model, Types, Document} from "mongoose";
import {BillType, ConsumeType} from "@src/interface";

const required = true;

//账单
export interface IBill extends Document {
  uuid: number,
  type: BillType
  amount: number,
  consumeType?: ConsumeType,
  consumeId?: Types.ObjectId,
  rechargeId?: string
}

const BillModel: Schema = new Schema({
  uuid: {type: Number, required},
  type: {type: BillType, required},
  amount: {type: Number, required},
  consumeType: {type: ConsumeType, required: false},
  consumeId: {type: Types.ObjectId, required: false},
  rechargeId: {type: String, required: false}
}, {
  timestamps: true
});

BillModel.index({uuid: 1})

export default model<IBill>("bill", BillModel);
