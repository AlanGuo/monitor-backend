import {Schema, model, Types, Document} from "mongoose";

const required = true;

export interface MessagePayment extends Document {
  uuid: number,
  messageId: Types.ObjectId,
}

const messagePaymentModel: Schema = new Schema({
  uuid: {type: Number, required},
  messageId: {type: Types.ObjectId, required},
}, {
  timestamps: true
});
messagePaymentModel.index({uuid: 1, messageId:1}, {unique: true})
export default model<MessagePayment>("messagePayment", messagePaymentModel);

//TODO add price amount