import {Schema, model, Types, Document} from "mongoose";
import {MEDIA_TYPE} from "@src/infrastructure/utils/constants";

const required = true;

export interface Media extends Document {
  type: MEDIA_TYPE,
  owner: number,
  fileName: string,
  size: { thumbnail?: string[], glass?: string[], image?: string[], duration?: number}
}

const MediaModel: Schema = new Schema({
  type: {type: MEDIA_TYPE, required},
  owner: {type: Number, required},
  fileName: {type: String, required},
  size: {type: Schema.Types.Mixed, default: {}}
}, {
  timestamps: true
});

export default model<Media>("media", MediaModel);
