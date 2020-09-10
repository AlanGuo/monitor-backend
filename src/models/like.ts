import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface ILike extends Document {
  postId: Types.ObjectId,
  uuid: number,
}

const likeModel: Schema = new Schema({
  postId: {type: Types.ObjectId, required},
  uuid: {type: Number, required},
}, {
  timestamps: true
});

export default model<ILike>("like", likeModel);
