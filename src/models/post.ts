import { POST_STATUS } from "@src/infrastructure/utils/constants";
import {Schema, model, Document} from "mongoose";

const required = true;

export interface Post extends Document {
  from: number,
  media?: string[],
  content?: string;
  deleted: boolean;
  like?: number;
  comment?: number;
  price: number;
  status?: POST_STATUS;
  tips?: number;
}

const postModel: Schema = new Schema({
  from: {type: Number, required},
  media: {type: Array(String), default: []},
  content: {type: String, default: ""},
  like: {type: Number, default: 0, min: 0},
  comment: {type: Number, default:0, min: 0},
  deleted: {type: Boolean, required, default: false},
  price: {type: Number, required, default: 0},
  tips: {type: Number, required, default: 0},
  status: { type: String, required, default: POST_STATUS.NORMAL},
}, {
  timestamps: true
});

export default model<Post>("post", postModel);
