import {Schema, model, Types, Document} from "mongoose";
import {WITHDRAW_APPLY_STATUS} from "@src/infrastructure/utils/constants";

const required = true;

export interface WithdrawApply extends Document {
  uuid: number,
  status: WITHDRAW_APPLY_STATUS,
  amount: number,
  intervalStart: number, // 提现时间区间
  intervalEnd: number,
  withdrawId?: Types.ObjectId
}

const withdrawApplyModel: Schema = new Schema({
  uuid: {type: Number, required},
  status: {type: WITHDRAW_APPLY_STATUS, required, default: WITHDRAW_APPLY_STATUS.PROCESSING},
  amount: {type: Number, required},
  intervalStart: {type: Number, required},
  intervalEnd: {type: Number, required},
  withdrawId: {type: Types.ObjectId, required: false}
}, {
  timestamps: true
});
withdrawApplyModel.index({uuid: 1})
export default model<WithdrawApply>("withdrawApply", withdrawApplyModel);
