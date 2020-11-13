import {Schema, model, Types, Document} from "mongoose";
import {NotificationStatus, NotificationType} from "@src/infrastructure/utils/constants";

const required = true;

//通知
export interface INotification extends Document {
  uuid: number,
  type: NotificationType,
  postId?: Types.ObjectId,
  commentId?: Types.ObjectId
  from?: number,
  message?: string,
  lastCommentId?: Types.ObjectId,
  messageId?: Types.ObjectId
  status: NotificationStatus
}

const NotificationModel: Schema = new Schema({
  uuid: {type: Number, required},
  from: {type: Number, required},
  type: {type: NotificationType, required},
  status: {type: NotificationStatus, required, default: NotificationStatus.unread},
  postId: {type: Types.ObjectId, required: false},
  commentId: {type: Types.ObjectId, required: false},
  lastCommentId: {type: Types.ObjectId, required: false},
  messageId: {type: Types.ObjectId, required: false},
  message: {type: String, required: false}
}, {
  timestamps: true
});

export default model<INotification>("notification", NotificationModel);
