import {OAUTH} from "@src/infrastructure/utils/constants";


export interface Profile {
  [OAUTH.GOOGLE]: GoogleProfile,
  [OAUTH.FACEBOOK]: FaceBookProfile,
  [OAUTH.TWITTER]: GoogleProfile
}

export interface User {
  uuid: number,
  name?: string,
  show_name?: string,
  email?: string
  sub_price?: number,
  self_desc?: string,
  self_web?: string,

  google?: string,
  twitter?: string,
  facebook?: string
  profile?: Profile,
}

export interface GoogleProfile {
  id: string,
  displayName?: string,
  emails?: { value: string, verified: boolean }[],
  photos?: { value: string }[],
  provider?: string
}

export interface FaceBookProfile {
  id: string,
  username?: string,
  displayName?: string,
  name?: { familyName?: string, givenName?: string, middleName?: string }[],
  provider?: string
}

export interface Pagination {
  offset: number,
  limit: number,
  page: number,
  size: number
}

export interface VideoAmazonUrl {
  screenshot: string,
  low: string,
  hd: string
}

export interface ImageAmazonUrl {
  url: string,
  thumbnail: string
}

export interface Config {
  HTTPS_PORT: number,
  API_PREFIX: string,
  AWS_ACCESS_KEY_ID: string,
  AWS_SECRET_ACCESS_KEY: string,
  AWS_REGION: string,
  AWS_SIGNATURE_VERSION: string,
  AWS_MEDIA_CONVERT: {
    "sourceBucket": string,
    "endpoint": string,
    "sourcePath": string,
    "videoDestination": string,
    "imageFolder": string,
    "videoFolder": string,
    "videoSourceFolder": string,
    "imageSourceFolder": string,
    "otherSourceFolder": string,
  },
  AWS_S3: {
    videoPrefix: string,
    imagePrefix: string,
    screenshotSuffix: string,
    lowSuffix: string,
    hdSuffix: string,
    successActionStatus: string,
  },
  AWS_CLOUDFRONT: {
    keyPairId: string,
    url: string,
    // 一小时
    timeLimit: number
  },
  CORS: {
    origin: string
  },
  WEBSOCKET: {
    origins: string
  },
  REDIS: {
    Host: string,
    Port: number,
    DB: number,
    Store_DB: number,
    Password: string
  },
  MONGODB: {
    Name: string,
    Connection_String_URI: string,
    Connection_String_URI_Test: string
  },
  FACEBOOK: {
    Client_Id: string,
    Client_Secret: string
  },
  GOOGLE: {
    Client_Id: string,
    Client_Secret: string,
  },
  TWITTER: {
    Consumer_Key: string,
    Consumer_Secret: string
  },
  HOST: string,
  RABBITMQ: string
}