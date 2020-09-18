import {Schema, model, Document} from "mongoose";
import {Profile} from "@src/interface";

const required = true;
const unique = true;
const sparse = true;

export interface IUser extends Document {
  uuid: number;
  name?: string;
  displayName?: string;
  email?: string;
  avatar?: string;

  subPrice?: number;
  chatPrice: number;
  about?: string;
  website?: string;
  bgImage?: string;
  location?: string;

  google?: string;
  twitter?: string;
  facebook?: string;
  oauthProfile?: Profile
}

const UserModel: Schema = new Schema({
  uuid: {type: Number, required, unique, sparse},
  // 默认为uuid，可自定义，不允许重复
  name: {type: String, required: false, unique, sparse},
  // 从第三方登录获取的昵称，可自定义，允许重复
  displayName: {type: String, required: false, sparse},
  email: {type: String, required: false, unique, sparse},
  avatar: {type: String, required: false, unique, sparse},
  subPrice: {type: Number, required: false, default: 0},
  chatPrice: {type: Number, required, default: 0},
  about: {type: String, required: false},
  website: {type: String, required: false},
  bgImage: {type: String, required: false},
  location: {type: String, required: false},

  google: {type: String, required: false, unique, sparse},
  twitter: {type: String, required: false, unique, sparse},
  facebook: {type: String, required: false, unique, sparse},
  oauthProfile: {type: Object, required: false}
}, {
  timestamps: true
});

UserModel.index({uuid: 1})
export default model<IUser>("user", UserModel);
