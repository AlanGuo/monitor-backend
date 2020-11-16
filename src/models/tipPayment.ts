import {Schema, model, Types, Document} from "mongoose";

const required = true;

export interface TipPayment extends Document {
  uuid: number,
  target: number,
  amount: number,
  postId?: Types.ObjectId
}

const tipPaymentModel: Schema = new Schema({
  uuid: {type: Number, required},
  target: {type: Number, required},
  amount: {type: Number, required},
  postId: {type: Types.ObjectId, required: false}
}, {
  timestamps: true
});
tipPaymentModel.index({uuid: 1})
tipPaymentModel.index({target: 1})
export default model<TipPayment>("tipPayment", tipPaymentModel);
