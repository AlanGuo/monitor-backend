import {Document, model, Schema, Types} from "mongoose";

const required = true;

export interface RecommendUser extends Document {
  uuid: number,
  endTime: Schema.Types.Date,
  startTime: Schema.Types.Date,
  sort: number
}

const recommendUserModel: Schema = new Schema({
  uuid: {type: Number, required},
  endTime: {type: Number, required},
  startTime: {type: Number, required}
}, {
  timestamps: true
});
recommendUserModel.index({uuid: 1, messageId:1}, {unique: true})
export default model<RecommendUser>("recommendUser", recommendUserModel);