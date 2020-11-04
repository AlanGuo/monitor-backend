import {Schema, model, Document} from "mongoose";
import {KYC_APPLY_STATUS} from "@src/infrastructure/utils/constants";

const required = true;

export interface IKYCApply extends Document {
  uuid: number,
  idNumber: string,
  idName: string,
  idCardFront: string,
  idCardReverse: string,
  handheld: string,
  status: KYC_APPLY_STATUS
  reply?: string
}

const KYCApplyModel: Schema = new Schema({
  uuid: {type: Number, required},
  idNumber: {type: String, required},
  idName: {type: String, required},
  idCardFront: {type: String, required},
  idCardReverse: {type: String, required},
  handheld: {type: String, required},
  status: {type: KYC_APPLY_STATUS, required},
  reply: {type: String}
}, {
  timestamps: true
});

export default model<IKYCApply>("kycApply", KYCApplyModel);
