import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface IComment extends Document {
  postId: number,
  from: number,
  mention?: string,
  content: string
}

const commentModel: Schema = new Schema({
  postId: {type: Number, required},
  from: {type: Number, required},
  content: { type: String, required },
  mention: {type: Number }
}, {
  timestamps: true
});

export default model<IComment>("comment", commentModel);
