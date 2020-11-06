import {Schema, model, Types, Document} from "mongoose";

const required = true;

//账单
export interface IBank extends Document {
  uuid: number;
  nameOnCard: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

const BankModel: Schema = new Schema({
  uuid: {type: Number, required},
  nameOnCard: {type: String, required},
  cardNumber: {type: String, required},
  expiry: {type: String, required},
  cvc: {type: String, required}
}, {
  timestamps: true
});

BankModel.index({uuid: 1})

export default model<IBank>("bank", BankModel);
