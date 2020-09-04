import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface Post extends Document {
  from: number,
  media?: string[],
  content?: string;
  deleted?: boolean;
}

const PostModel: Schema = new Schema({
  from: {type: Number, required},
  media: {type: Array(String), default: []},
  content: {type: String, default: ""},
  deleted: {type: Boolean }
}, {
  timestamps: true
});

export default model<Post>("post", PostModel);
