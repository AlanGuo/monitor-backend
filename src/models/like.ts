import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface ILike extends Document {
  postId: number,
  from: number,
}

const likeModel: Schema = new Schema({
  postId: {type: Number, required},
  from: {type: Number, required},
}, {
  timestamps: true
});

export default model<ILike>("like", likeModel);
