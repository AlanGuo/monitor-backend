import {Schema, Types, model, Document} from "mongoose";

const required = true;

export interface IBankCard extends Document {
  postId: Types.ObjectId,
  uuid: number,
}

const BankCardModel: Schema = new Schema({
  postId: {type: Types.ObjectId, required},
  uuid: {type: Number, required},
}, {
  timestamps: true
});

export default model<IBankCard>("bankCard", BankCardModel);
