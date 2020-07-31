import { Schema, Types, model, Document } from "mongoose";

const required = true;
const unique = true;

export interface IUser extends Document {
  _id: string,
  name: string,
  show_name: string,
  email: string
  sub_price: number,
  self_desc: string,
  self_web: string,

  google_id: string,

}

const UserModel: Schema = new Schema({
  _id: {type:String, required, unique},
  name: {type: String, required: false, unique},
  show_name: {type: String, required: false, unique},
  email: {type: String, required: false, unique},


}, {
  timestamps: true
});


export default model<IUser>("user", UserModel);
