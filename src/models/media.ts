import {Schema, model, Document} from "mongoose";
import {MEDIA_TYPE} from "@src/infrastructure/utils/constants";

const required = true;

export interface Media extends Document {
  type: MEDIA_TYPE,
  owner: number,
  fileName: string,
  price?: string;
}

const MediaModel: Schema = new Schema({
  type: {type: MEDIA_TYPE, required},
  owner: {type: Number, required},
  fileName: {type: String, required},
  price: {type: String, required, default: "0"}
}, {
  timestamps: true
});

export default model<Media>("media", MediaModel);
