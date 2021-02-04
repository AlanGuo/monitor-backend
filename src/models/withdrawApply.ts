import {Schema, model, Types, Document} from "mongoose";
import {WITHDRAW_APPLY_STATUS} from "@src/infrastructure/utils/constants";
import BigNumber from "bignumber.js";

const required = true;

export interface WithdrawApply extends Document {
  uuid: number,
  status: WITHDRAW_APPLY_STATUS,
  amount: BigNumber,
  withdrawId?: Types.ObjectId
}

const withdrawApplyModel: Schema = new Schema({
  uuid: {type: Number, required},
  status: {type: WITHDRAW_APPLY_STATUS, required, default: WITHDRAW_APPLY_STATUS.PROCESSING},
  amount: {type: String, required},
  withdrawId: {type: Types.ObjectId, required: false}
}, {
  timestamps: true
});
withdrawApplyModel.index({uuid: 1})
export default model<WithdrawApply>("withdrawApply", withdrawApplyModel);
