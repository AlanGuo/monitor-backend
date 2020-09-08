import {Schema, Types, model, Document} from "mongoose";
import {Profile} from "@src/interface";

const required = true;
const unique = true;
const sparse = true;

export interface IUser extends Document {
  uuid: number,
  name?: string,
  displayName?: string,
  email?: string,
  avatar? :string,

  subPrice?: number,
  desc?: string,
  website?: string,

  google?: string,
  twitter?: string,
  facebook?: string,
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
  subPrice: {type: Number, required: false},
  desc: {type: String, required: false},
  website: {type: String, required: false},
  bgImage: {type: String, required: false},

  google: {type: String, required: false, unique, sparse},
  twitter: {type: String, required: false, unique, sparse},
  facebook: {type: String, required: false, unique, sparse},
  oauthProfile: {type: Object, required: false}
}, {
  timestamps: true
});


export default model<IUser>("user", UserModel);
