import {Schema, Types, model, Document} from "mongoose";
import {Profile} from "@src/interface";

const required = true;
const unique = true;
const sparse = true;

export interface IUser extends Document {
  uuid: number,
  name?: string,
  show_name?: string,
  email?: string
  sub_price?: number,
  self_desc?: string,
  self_web?: string,

  google?: string,
  twitter?: Types.ObjectId,
  facebook?: Types.ObjectId,
  oauth_profile: Profile


}

const UserModel: Schema = new Schema({
  uuid: {type: Number, required, unique, sparse},
  name: {type: String, required: false, unique, sparse},
  show_name: {type: String, required: false, unique, sparse},
  email: {type: String, required: false, unique, sparse},
  sub_price: {type: Number, required: false},
  self_desc: {type: String, required: false},
  self_web: {type: String, required: false},

  google: {type: String, required: false, unique, sparse},
  twitter: {type: String, required: false, unique, sparse},
  facebook: {type: String, required: false, unique, sparse},
  oauth_profile: {type: Object, required: false}
}, {
  timestamps: true
});


export default model<IUser>("user", UserModel);
