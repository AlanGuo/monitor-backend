import {Schema, model, Document} from "mongoose";

const required = true;

export interface Message extends Document {
  from: number,
  to: number,
  // media?: Schema.Types.ObjectId[],
  media?: string[],
  content?: string
  price: number
}

const MessageModel: Schema = new Schema({
  from: {type: Number, required},
  to: {type: Number, required},
  // media: {type: Array(Schema.Types.ObjectId)},
  media: {type: Array(String), default: []},
  content: {type: String},
  price: {type: Number, default: 0}
}, {
  timestamps: true
});

export default model<Message>("message", MessageModel);
