import config from "@src/infrastructure/utils/config";
import {Consumer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  NOTIFICATION_ROUTING_KEY, NotificationStatus, NotificationType,
  RABBITMQ_EXCHANGE_TYPE,
  SAVE_NOTIFICATION_QUEUE, SOCKET_CHANNEL,

} from "@src/infrastructure/utils/constants";
import {Types} from "mongoose";
import NotificationModel from "@src/models/notification";
import SubscriberModel from "@src/models/subscriber";
import PostModel from "@src/models/post";
import CommentModel from "@src/models/comment";
import {getOnlineUser} from "@src/infrastructure/redis";
import {getSocketIO} from "@src/infrastructure/socket";


export async function loadSaveNotificationConsume() {
  const consumer = new Consumer(SAVE_NOTIFICATION_QUEUE, NOTIFICATION_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await consumer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  await consumer.consume(async msg => {
    const tmp: { type: NotificationType, uuid: number, [propName: string]: any } = JSON.parse(msg);
    console.log('save notification:', msg);
    switch (tmp.type) {
      case NotificationType.chat:
        await handleChat();
        break;
      case NotificationType.newPost:
        await handleNewPost(tmp);
        break;
      case NotificationType.kycPass:
        await handleKYCPass(tmp);
        break;
      case NotificationType.kycVeto:
        await handleKYCVeto(tmp);
        break;
      case NotificationType.postComment:
        await handlePostComment(tmp);
        break;
      case NotificationType.postLike:
        await handlePostLike(tmp);
        break;
      case NotificationType.postTip:
        await handlePostTip(tmp);
        break;
      case NotificationType.commentLike:
        await handleCommentLike(tmp);
        break;
      case NotificationType.commentReply:
        await handleCommentReply(tmp);
        break;
      case NotificationType.postPay:
        await handlePostPay(tmp);
        break;
      case NotificationType.messagePay:
        await handleMessagePay(tmp);
        break;
      case NotificationType.followExpired:
        await handleFollowExpired(tmp);
        break;
      case NotificationType.subExpired:
        await handleSubExpired(tmp);
        break;
      case NotificationType.subCancel:
        await handleSubCancel(tmp);
        break;
      case NotificationType.sub:
        await handleSub(tmp);
        break;
      case NotificationType.tip:
        await handleTip(tmp);
        break;
      case NotificationType.followReBill:
        await handleFollowReBill(tmp);
        break
    }
  })
}

async function socketPublish(message: { uuid: number, [propName: string]: any }) {
  const sid = await getOnlineUser(message.uuid);
  if (sid) {
    const io = getSocketIO();
    io.sockets.connected[sid]?.emit(SOCKET_CHANNEL.NEW_NOTIFICATION, JSON.stringify(message))
  }
}

async function handleChat() {
  // 可以用message 未读 按from 进行分类 进行chat通知
  // TODO
}

async function handleNewPost(msg: any) {
  msg = msg as { type: NotificationType, post: { _id: Types.ObjectId, from: number } };
  const fans = await SubscriberModel.find({target: msg.post.from}, {uuid: 1})
  const notifications = fans.map(fan => {
    return {type: NotificationType.newPost, uuid: fan.uuid, postId: msg.post._id, from: msg.post.from}
  })
  await NotificationModel.insertMany(notifications)
  for (const item of notifications) {
    await socketPublish(item);
  }
}

async function handleKYCPass(msg: any) {
  msg = msg as { type: NotificationType, uuid: number }
  const notification = {type: NotificationType.kycPass, uuid: msg.uuid, status: NotificationStatus.unread}
  await NotificationModel.create(notification);
  await socketPublish(notification)
}

async function handleKYCVeto(msg: any) {
  msg = msg as { type: NotificationType, uuid: number, reply: string }
  const notification = {
    type: NotificationType.kycVeto,
    uuid: msg.uuid,
    message: msg.repl,
    status: NotificationStatus.unread
  };
  await NotificationModel.create(notification);
  await socketPublish(notification)

}

async function handlePostComment(msg: any) {
  msg = msg as { type: NotificationType.postComment, postId: Types.ObjectId, from: number, commentId: Types.ObjectId };
  const post = await PostModel.findOne({_id: msg.postId}, {from: 1})
  if (post) {
    const notification = {
      uuid: post.from,
      type: NotificationType.postComment,
      from: msg.from,
      postId: msg.postId,
      commentId: msg.commentId,
      status: NotificationStatus.unread
    };
    await NotificationModel.create(notification);
    await socketPublish(notification);
  }
}

async function handlePostLike(msg: any) {
  msg = msg as { type: NotificationType.postLike, postId: Types.ObjectId, from: number };
  const post = await PostModel.findOne({_id: msg.postId}, {from: 1})
  if (post) {
    const notification = {
      type: NotificationType.postLike,
      uuid: post.from,
      postId: msg.postId,
      from: msg.from,
      status: NotificationStatus.unread
    };
    await NotificationModel.create(notification);
    await socketPublish(notification);
  }
}

async function handlePostTip(msg: any) {
  // TODO
}

async function handleCommentLike(msg: any) {
  msg = msg as { type: NotificationType.commentLike, commentId: Types.ObjectId, from: number };
  const comment = await CommentModel.findOne({_id: msg.commentId}, {uuid: 1});
  if (comment) {
    const notification = {
      type: NotificationType.commentLike,
      uuid: comment.uuid,
      commentId: msg.commentId,
      from: msg.from,
      status: NotificationStatus.unread
    };
    await NotificationModel.create(notification);
    await socketPublish(notification);
  }
}

async function handleCommentReply(msg: any) {
  msg = msg as { type: NotificationType.commentReply, postId: Types.ObjectId, from: number, commentId: Types.ObjectId, lastCommentId: Types.ObjectId };
  const post = await PostModel.findOne({_id: msg.postId}, {from: 1})
  const comment = await CommentModel.findOne({_id: msg.lastCommentId}, {uuid: 1});
  if (post) {
    const notification = {
      type: NotificationType.postComment,
      uuid: post.from,
      from: msg.from,
      postId: msg.postId,
      commentId: msg.commentId,
      status: NotificationStatus.unread
    };
    await NotificationModel.create(notification);
    await socketPublish(notification);
  }
  if (comment) {
    const notification = {
      type: NotificationType.commentReply,
      uuid: comment.uuid,
      postId: msg.postId,
      commentId: msg.commentId,
      lastCommentId: msg.lastCommentId,
      from: msg.from,
      status: NotificationStatus.unread
    };
    await NotificationModel.create(notification);
    await socketPublish(notification);
  }
}

async function handlePostPay(msg: any) {
  msg = msg as { type: NotificationType.postPay, postId: Types.ObjectId, from: number, uuid: number };
  const notification = {
    type: NotificationType.postPay,
    uuid: msg.uuid,
    postId: msg.postId,
    from: msg.from,
    status: NotificationStatus.unread
  };
  await NotificationModel.create(notification);
  await socketPublish(notification);
}

async function handleMessagePay(msg: any) {
  msg = msg as { type: NotificationType.messagePay, msgId: Types.ObjectId, from: number, uuid: number };
  const notification = {
    type: NotificationType.messagePay,
    uuid: msg.uuid,
    messageId: msg.msgId,
    from: msg.from,
    status: NotificationStatus.unread
  };
  await NotificationModel.create(notification);
  await socketPublish(notification);
}

async function handleFollowExpired(msg: any) {
  // TODO
}

async function handleSubExpired(msg: any) {
  // TODO
}

async function handleSubCancel(msg: any) {
  msg = msg as { type: NotificationType.subCancel, uuid: number, from: number };
  const notification = {
    type: NotificationType.subCancel,
    uuid: msg.uuid,
    from: msg.from,
    status: NotificationStatus.unread
  };
  await NotificationModel.create(notification);
  await socketPublish(notification);
}

async function handleSub(msg: any) {
  msg = msg as { type: NotificationType.sub, uuid: number, from: number };
  const notification = {
    type: NotificationType.sub,
    uuid: msg.uuid,
    from: msg.from,
    status: NotificationStatus.unread
  };
  await NotificationModel.create(notification);
  await socketPublish(notification);
}

async function handleTip(msg: any) {
  // TODO
}

async function handleFollowReBill(msg: any) {
  // TODO
}