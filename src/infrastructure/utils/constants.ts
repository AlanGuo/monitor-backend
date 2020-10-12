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
  CREATE_DIALOGUE = "create dialogue"
}

export enum MEDIA_TYPE {
  UNKNOWN = "unknown",
  IMAGE = "image",
  VIDEO = "video",
}

export enum Sequence {
  USER = "user"
}

export enum RESPONSE_CODE {
  NORMAL = 0,
  ERROR = 500,
  LOGIN_IN_ERR = "login in error",
  CAN_NOT_SUBSCRIBE_YOURSELF = "can not subscribe yourself",
  CAN_NOT_UNSUBSCRIBE_YOURSELF = "can not unsubscribe yourself",
  USER_NOT_EXISTS = "user not exists",
  BALANCE_NOT_ENOUGH = "balance not enough"
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
export const SESSION_OVERDUE_SECOND = 60 * 60 * 24 * 1000;
export const SESSION_KEY = "justfans";
export const ONLINE_USER_KEY = "online_user";

export const MESSAGE_ROUTING_KEY = "message";
export const MEDIA_ROUTING_KEY = "media";
export const JUSTFANS_EXCHANGE = "justfans";
export const SAVE_MESSAGE_QUEUE = "save_message";
export const SAVE_MEDIA_QUEUE = "save_media";
export const SEND_MESSAGE_QUEUE = "send_message";
export const UPDATE_DIALOGUE_QUEUE = "update_dialogue";
