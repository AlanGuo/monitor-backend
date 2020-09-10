import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface ICommentLike extends Document {
  commentId: Types.ObjectId,
  uuid: number,
}

const commentLikeModel: Schema = new Schema({
  commentId: {type: Types.ObjectId, required},
  uuid: {type: Number, required},
}, {
  timestamps: true
});

export default model<ICommentLike>("commentlike", commentLikeModel);
