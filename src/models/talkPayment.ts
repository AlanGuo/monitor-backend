import {Schema, model, Types, Document} from "mongoose";

const required = true;

export interface TalkPayment extends Document {
  uuid: number,
  target: number,
  price: number,
  amount: number
}

const talkPaymentModel: Schema = new Schema({
  uuid: {type: Number, required},
  target: {type: Number, required},
  price: {type: Number, required},
  amount: {type: Number, required}
}, {
  timestamps: true
});
talkPaymentModel.index({uuid: 1})
talkPaymentModel.index({target: 1})
export default model<TalkPayment>("talkPaymentModel", talkPaymentModel);
