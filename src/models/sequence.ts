import {Schema, model, Document} from "mongoose";

const required = true;
const unique = true;

export interface Sequence extends Document {
  _id: string,
  value: number
}

const SequenceModel: Schema = new Schema({
  _id: {type: String, required},
  value: {type: Number, required, unique}
});


export default model<Sequence>("sequence", SequenceModel);
