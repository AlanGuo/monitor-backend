import {Schema, model, Document} from "mongoose";
import {Profile} from "@src/interface";
import {USER_STATUS} from "@src/infrastructure/utils/constants";

const required = true;
const unique = true;
const sparse = true;

export interface IUser extends Document {
  uuid: number;
  name?: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  balance: number;
  subPrice: number;
  chatPrice: number;
  about?: string;
  website?: string;
  bgImage?: string;
  location?: string;

  google?: string;
  twitter?: string;
  facebook?: string;
  oauthProfile?: Profile;

  kyc: boolean;
  broardcaster: boolean;
  earnBalance: number;
  freezeEarnBalance: number;
  totalWithdrawal: number;
  status: USER_STATUS;

  withdrawTime: number;
}

const UserModel: Schema = new Schema({
  uuid: {type: Number, required, unique, sparse},
  // 默认为uuid，可自定义，不允许重复
  name: {type: String, required: false, unique, sparse},
  // 从第三方登录获取的昵称，可自定义，允许重复
  displayName: {type: String, required: false, sparse},
  email: {type: String, required: false, unique, sparse},
  avatar: {type: String, required: false, unique, sparse},
  balance: {type: Number, required, default: 0},
  earnBalance: {type: Number, required, default: 0},
  freezeEarnBalance: {type: Number, required, default: 0},
  totalWithdrawal: {type: Number, required, default: 0},
  subPrice: {type: Number, required, default: 0},
  chatPrice: {type: Number, required, default: 0},
  about: {type: String, required: false},
  website: {type: String, required: false},
  bgImage: {type: String, required: false},
  location: {type: String, required: false},

  google: {type: String, required: false, unique, sparse},
  twitter: {type: String, required: false, unique, sparse},
  facebook: {type: String, required: false, unique, sparse},
  oauthProfile: {type: Object, required: false},

  kyc: {type: Boolean, required, default: false},
  broardcaster: {type: Boolean, required, default: false},
  status: {type: USER_STATUS, required, default: USER_STATUS.NORMAL},
  withdrawTime: {type: Number, required, default: 0},
}, {
  timestamps: true
});

UserModel.index({uuid: 1});
UserModel.index({name: 1});
export default model<IUser>("user", UserModel);
