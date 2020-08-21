import {Schema, Types, model, Document} from "mongoose";
import {MEDIA_TYPE} from "@src/infrastructure/utils/constants";
import {BigNumber} from "bignumber.js";

const required = true;

export interface Media extends Document {
  type: MEDIA_TYPE,
  owner: Types.ObjectId,
  fileName: string,
  price?: BigNumber;
}

const MediaModel: Schema = new Schema({
  type: {type: MEDIA_TYPE, required},
  owner: {type: Schema.Types.ObjectId, required},
  fileName: {type: String, required},
  price: {type: BigNumber, required, default: new BigNumber(0)}
}, {
  timestamps: true
});

export default model<Media>("media", MediaModel);
