import {Schema, model, Types, Document} from "mongoose";

const required = true;

export interface SubscriberPayment extends Document {
  uuid: number,
  target: number,
  amount: number,
  price: number,
}

const subscriberPaymentModel: Schema = new Schema({
  uuid: {type: Number, required},
  target: {type: Number, required},
  amount: {type: Number, required},
  price: {type: Number, required}
}, {
  timestamps: true
});
subscriberPaymentModel.index({uuid: 1})
subscriberPaymentModel.index({target: 1})

export default model<SubscriberPayment>("subscriberPayment", subscriberPaymentModel);
