import {Schema, model, Types, Document} from "mongoose";
import {NotificationType} from "@src/interface";

const required = true;

//通知
export interface INotification extends Document {
  uuid: number,
  type: NotificationType,
  joinId: Types.ObjectId

}

const NotificationModel: Schema = new Schema({
  uuid: {type: Number, required},
  type: {type: NotificationType, required},
  joinId: {type: Types.ObjectId, required: false},
}, {
  timestamps: true
});

export default model<INotification>("notification", NotificationModel);
