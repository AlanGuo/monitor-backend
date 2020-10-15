import {Schema, model, Types, Document} from "mongoose";

const required = true;

export interface PostPayment extends Document {
  uuid: number,
  postId: Types.ObjectId,
  price: number,
  amount: number
}

const postPaymentModel: Schema = new Schema({
  uuid: {type: Number, required},
  postId: {type: Types.ObjectId, required},
  price: {type: Number, required},
  amount: {type: Number, required}
}, {
  timestamps: true
});
postPaymentModel.index({uuid: 1, postId:1}, {unique: true})
export default model<PostPayment>("postPayment", postPaymentModel);
