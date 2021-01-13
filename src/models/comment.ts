import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface IComment extends Document {
  postId: string;
  uuid: number;
  mention?: string;
  content: string;
  like?: number;
  deleted: boolean;
  commentId?: Types.ObjectId
}

const CommentModel: Schema = new Schema({
  postId: {type: String, required},
  uuid: {type: Number, required},
  content: { type: String, required },
  mention: {type: String },
  like: {type: Number, default: 0, min: 0},
  deleted: {type: Boolean, required},
  commentId: {type: Types.ObjectId, required: false}
}, {
  timestamps: true
});

CommentModel.index({uuid: 1});

export default model<IComment>("comment", CommentModel);
