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

export enum MEDIA_PURPOSE {
  CHAT = "chat",
  POST = "post"
}

export enum SOCKET_CHANNEL {
  CHAT_MESSAGE = "chat message",
  MEDIA_CONVERTED = "media converted"
}

export enum MEDIA_TYPE {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO"
}

export enum Sequence {
  USER = "USER"
}

export enum RESPONSE_CODE {
  NORMAL = 0,
  LOGIN_IN_ERR = 1
}

export enum RABBITMQ_EXCHANGE_TYPE {
  FANOUT = "fanout",
  DIRECT = "direct",
  TOPIC = "topic",
  HEADERS = "headers"
}

export const USER_SEQUENCE_INIT = 10000000;
export const AUTH_TOKEN_OVERDUE_SECOND = 60 * 60 * 12;
export const SESSION_OVERDUE_SECOND = 60 * 60 * 24 * 1000;
export const SESSION_KEY = "justfans";
export const ONLINE_USER_KEY = "online_user";

export const MESSAGE_ROUTING_KEY = "message";
export const JUSTFANS_EXCHANGE = "justfans";
export const SAVE_MESSAGE_QUEUE = "save_message";
export const SEND_MESSAGE_QUEUE = "send_message";
