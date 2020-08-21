import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface Message extends Document {
  from: number,
  to: number,
  media?: string,
  content?: string
}

const MessageModel: Schema = new Schema({
  from: {type: Number, required},
  to: {type: Number, required},
  media: {type: Schema.Types.ObjectId},
  content: {type: String}
}, {
  timestamps: true
});

export default model<Message>("message", MessageModel);
