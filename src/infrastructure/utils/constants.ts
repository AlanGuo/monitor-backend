export enum REQUEST_METHOD {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete"
}

export enum OAUTH {
  FACEBOOK = "facebook",
  GOOGLE = "google",
  TWITTER = "twitter"
}

export enum SOCKET_CHANNEL {
  CHAT_MESSAGE = "chat message",
  MEDIA_CONVERTED = "media converted",
  CREATE_DIALOGUE = "create dialogue",
  MEDIA_CONVERT_START = "media convert start"
}

export enum MEDIA_TYPE {
  UNKNOWN = "unknown",
  IMAGE = "image",
  VIDEO = "video",
}

export enum Sequence {
  USER = "user"
}

export enum KYC_APPLY_STATUS {
  AUDIT = "audit",
  PASS = "pass",
  VETO = "veto"
}

export enum Currency {
  usd = "usd"
}

export enum OrderStatus {
  created = "created",
  payed = "payed",
}

export enum OrderType {
  deposit = "deposit"
}

export enum BillType {
  deposit = "deposit",
  consume = "consume"
}

export enum ConsumeType {
  message = "messagePayment",
  post = "postPayment",
  subscriber = "subscriberPayment",
  talk = "talkPayment"
}

export enum NotificationType {
  chat = "chat",                // 聊天消息
  newPost = "newPost",          // 关注的人新发了post
  postComment = "postComment",  // post 被评论
  postLike = "postLike",        // post 被点赞
  postTip = "postTip",          // post 被打赏
  commentLike = "commentLike",  // 评论被点赞
  commentReply = "commentReply", // 评论被回复
  postPay = "postPay",          // 对post付费解锁
  messagePay = "messagePay",    // 对message付费解锁
  followExpired = "followExpired", // 订阅过期
  followReBill = "followReBill", // 订阅自动续费
  subExpired = "subExpired",    // 被订阅过期
  subCancel = "subCancel",      // 被取消订阅
  sub = "sub",                  // 被关注
  tip = "tip",                  // 被打赏
  kycPass = "kycPass",          // KYC通过
  kycVeto = "kycVeto",          // KYC拒绝
  other = "other",              //

  // interactions = "interactions",
  // purchases = "purchases",
  // subscribed = "subscribed",
  // unSubscribed = "unSubscribed"
}

export enum NotificationStatus {
  unread,
  read
}

export enum RESPONSE_CODE {
  NORMAL = 0,
  SHOW_MESSAGE= 1,
  ERROR = 500,
  LOGIN_IN_ERR = "login in error",
  CAN_NOT_SUBSCRIBE_YOURSELF = "can not subscribe yourself",
  CAN_NOT_UNSUBSCRIBE_YOURSELF = "can not unsubscribe yourself",
  USER_NOT_EXISTS = "user not exists",
  BALANCE_NOT_ENOUGH = "balance not enough"
}

export enum SUBSCRIBER_STATUS {
  ACTIVE,
  EXPIRED
}

export enum RABBITMQ_EXCHANGE_TYPE {
  FANOUT = "fanout",
  DIRECT = "direct",
  TOPIC = "topic",
  HEADERS = "headers"
}
export enum USER_STATUS {
  NORMAL,
  BLOCKED
}

export const USER_SEQUENCE_INIT = 10000000;
export const AUTH_TOKEN_OVERDUE_SECOND = 60 * 60 * 12;
export const SESSION_OVERDUE_SECOND = 60 * 60 * 24 * 7 * 1000 ;
export const SESSION_KEY = "justfans";
export const ONLINE_USER_KEY = "online_user";

export const MESSAGE_ROUTING_KEY = "message";
export const MEDIA_ROUTING_KEY = "media";
export const USER_SUB_PRICE_ROUTING_KEY = "user_sub_price";
export const JUSTFANS_EXCHANGE = "justfans";
export const SAVE_MESSAGE_QUEUE = "save_message";
export const SAVE_MEDIA_QUEUE = "save_media";
export const UPDATE_USER_SUB_PRICE_QUEUE = "update_user_sub_price"
export const SAVE_NOTIFICATION_QUEUE = "send_notification"
export const NOTIFICATION_ROUTING_KEY = "notification"