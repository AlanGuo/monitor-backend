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

export enum Sequence {
  USER = "USER"
}


export const USER_SEQUENCE_INIT = 10000000;
export const AUTH_TOKEN_OVERDUE_SECOND = 60 * 60 * 12;
export const SESSION_OVERDUE_SECOND = 60 * 60 * 24 * 1000;
export const SESSION_KEY = "justfans";
