import {Schema, model, Types, Document} from "mongoose";

const required = true;
const sparse = true;

//举报
export interface IReport extends Document {
  uuid: number,
  postId: Types.ObjectId,
  reason: string
}

const ReportModel: Schema = new Schema({
  uuid: {type: Number, required},
  postId: {type: Types.ObjectId, required},
  reason: {type: String, required}
}, {
  timestamps: true
});

export default model<IReport>("report", ReportModel);
