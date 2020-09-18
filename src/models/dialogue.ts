import {Schema, model, Document} from "mongoose";

const required = true;

export interface Dialogue extends Document {
  from: number,
  to: number,
  show: boolean,
  timeline: number
}

const DialogueModel: Schema = new Schema({
  from: {type: Number, required},
  to: {type: Number, required},
  show: {type: Schema.Types.Boolean, required, default: true},
  timeline: {type: Schema.Types.Number, required, default: 1}
}, {
  timestamps: true,
});
DialogueModel.index({from: 1, to:1}, {unique: true})
export default model<Dialogue>("dialogue", DialogueModel);
