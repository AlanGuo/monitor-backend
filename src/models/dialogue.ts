import {Schema, model, Document} from "mongoose";
import {DialogueStatus} from "@src/infrastructure/utils/constants";

const required = true;

export interface Dialogue extends Document {
  from: number,
  to: number,
  show: boolean,
  timeline: number,
  canTalk: number,
  status: DialogueStatus
}

const DialogueModel: Schema = new Schema({
  from: {type: Number, required},
  to: {type: Number, required},
  show: {type: Schema.Types.Boolean, required, default: true},
  timeline: {type: Schema.Types.Number, required, default: 1},
  canTalk: {type: Schema.Types.Number, required, default: -1},
  status: {type: DialogueStatus, required, default: DialogueStatus.read}
}, {
  timestamps: true,
});
DialogueModel.index({from: 1, to:1}, {unique: true});
export default model<Dialogue>("dialogue", DialogueModel);
