import config from "@src/infrastructure/utils/config";
import {Consumer} from "@src/infrastructure/rabbitMq";
import {
  JUSTFANS_EXCHANGE,
  NOTIFICATION_ROUTING_KEY, NotificationType,
  RABBITMQ_EXCHANGE_TYPE,
  SAVE_NOTIFICATION_QUEUE,

} from "@src/infrastructure/utils/constants";
import NotificationModel from "@src/models/notification";

export async function loadSaveNotificationConsume() {
  const consumer = new Consumer(SAVE_NOTIFICATION_QUEUE, NOTIFICATION_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await consumer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  await consumer.consume(async msg => {
    const tmp: { type: NotificationType, [key: string]: any } = JSON.parse(msg);
    console.log('save notification:', msg);
    switch (tmp.type) {
      case NotificationType.chat:
        await handleChat();
        break;
      case NotificationType.newPost:
        await handleNewPost();
        break;
      case NotificationType.kycPass:
        await handleKYCPass();
        break;
      case NotificationType.kycVeto:
        await handleKYCVeto();
        break;
      case NotificationType.postComment:
        await handlePostComment();
        break;
      case NotificationType.postLike:
        await handlePostLike();
        break;
      case NotificationType.postTip:
        await handlePostTip();
        break;
      case NotificationType.commentLike:
        await handleCommentLike();
        break;
      case NotificationType.commentReply:
        await handleCommentReply();
        break;
      case NotificationType.postPay:
        await handlePostPay();
        break;
      case NotificationType.messagePay:
        await handleMessagePay();
        break;
      case NotificationType.followExpired:
        await handleFollowExpired();
        break;
      case NotificationType.subExpired:
        await handleSubExpired();
        break;
      case NotificationType.subCancel:
        await handleSubCancel();
        break;
      case NotificationType.sub:
        await handleSub();
        break;
      case NotificationType.tip:
        await handleTip();
        break;
    }
  })
}

async function handleChat () {
  // TODO
}

async function handleNewPost () {
  // TODO
}

async function handleKYCPass () {
  // TODO
}

async function handleKYCVeto () {
  // TODO
}

async function handlePostComment () {
  // TODO
}

async function handlePostLike () {
  // TODO
}

async function handlePostTip () {
  // TODO
}

async function handleCommentLike () {
  // TODO
}

async function handleCommentReply () {
  // TODO
}

async function handlePostPay () {
  // TODO
}

async function handleMessagePay () {
  // TODO
}

async function handleFollowExpired () {
  // TODO
}

async function handleSubExpired () {
  // TODO
}

async function handleSubCancel () {
  // TODO
}

async function handleSub () {
  // TODO
}

async function handleTip () {
  // TODO
}