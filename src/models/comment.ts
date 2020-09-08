import {Schema, Types, model, Document} from "mongoose";
import { stringType } from "aws-sdk/clients/iam";

const required = true;

export interface IComment extends Document {
  postId: stringType,
  uuid: number,
  mention?: string,
  content: string,
  deleted: boolean
}

const commentModel: Schema = new Schema({
  postId: {type: String, required},
  uuid: {type: Number, required},
  content: { type: String, required },
  mention: {type: Number },
  deleted: {type: Boolean, required},
}, {
  timestamps: true
});

export default model<IComment>("comment", commentModel);
