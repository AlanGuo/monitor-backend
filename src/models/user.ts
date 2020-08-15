import {Schema, Types, model, Document} from "mongoose";
import {Profile} from "@src/interface";

const required = true;
const unique = true;
const sparse = true;

export interface IUser extends Document {
  uuid: number,
  name?: string,
  showName?: string,
  email?: string
  subPrice?: number,
  selfDesc?: string,
  selfWeb?: string,

  google?: string,
  twitter?: string,
  facebook?: string,
  oauthProfile?: Profile


}

const UserModel: Schema = new Schema({
  uuid: {type: Number, required, unique, sparse},
  name: {type: String, required: false, unique, sparse},
  showName: {type: String, required: false, unique, sparse},
  email: {type: String, required: false, unique, sparse},
  subPrice: {type: Number, required: false},
  selfDesc: {type: String, required: false},
  selfWeb: {type: String, required: false},

  google: {type: String, required: false, unique, sparse},
  twitter: {type: String, required: false, unique, sparse},
  facebook: {type: String, required: false, unique, sparse},
  oauthProfile: {type: Object, required: false}
}, {
  timestamps: true
});


export default model<IUser>("user", UserModel);
