import {Schema, model, Types, Document} from "mongoose";

const required = true;

export interface MessagePayment extends Document {
  uuid: number,
  messageId: Types.ObjectId,
  price: number,
  amount: number
}

const messagePaymentModel: Schema = new Schema({
  uuid: {type: Number, required},
  messageId: {type: Types.ObjectId, required},
  price: {type: Number, required},
  amount: {type: Number, required}
}, {
  timestamps: true
});
messagePaymentModel.index({uuid: 1, messageId:1}, {unique: true})
export default model<MessagePayment>("messagePayment", messagePaymentModel);
