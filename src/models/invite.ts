import {Schema, model, Types, Document} from "mongoose";
import BigNumber from "bignumber.js";

const required = true;
const sparse = true;

//邀请
export interface IInvite extends Document {
  uuid: number,
  inviteUser: number,
  indirectInviteUser?: number,
  commissionAmount: BigNumber,
  level: 1 | 2
}

const InviteModel: Schema = new Schema({
  uuid: {type: Number, required}, // 被邀请人
  inviteUser: {type: Number, required}, // 邀请人
  indirectInviteUser: {type: Number, required: false}, // 间接邀请人 当level=2 记录中间人
  level: {type: Number, required}, // 层级
  commissionAmount: {type: String, required, default: 0},
}, {
  timestamps: true
});

InviteModel.index({uuid: 1, level: 1});
InviteModel.index({uuid: 1});
InviteModel.index({inviteUser: 1});

export default model<IInvite>("invite", InviteModel);
