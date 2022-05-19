import {MEDIA_TYPE, OAUTH} from "@src/infrastructure/utils/constants";
import {Types} from "mongoose";


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
  subPrice?: number,
  chatPrice: number
  selfDesc?: string,
  selfWeb?: string,

  google?: string,
  twitter?: string,
  facebook?: string
  profile?: Profile,
}

export interface CreateDialogue {
  to: number
}

export interface Message {
  _id: Types.ObjectId
  from: number;
  to: number;
  content: string;
  media: MessageMedia[];
  price: number,
  payment?: boolean
}

export interface MessageMedia {
  type: MEDIA_TYPE;
  fileName?: string;
  key?: string;
  ready?: boolean;
  urls: {
    // for local preview
    dataUri?: string;
    // for image
    url?: string;
    thumbnail?: string;
    // for video
    screenshot?: string;
    low?: string;
    hd?: string;
  };
  size?: any
}

export interface MediaConvertCache {
  subscribers: number[],
  owner: number,
  fileCount: number,
  key: string,
  free?: boolean,
  glassSize?: string[],
  thumbnailSize?: string[],
  screenshotSize?: string[],
  imageSize?: string[]
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
  low?: string,
  hd?: string
}

export interface ImageAmazonUrl {
  url?: string,
  thumbnail?: string
  glass?: string
}

export interface Config {
  HTTPS_PORT: number,
  API_PREFIX: string,
  DEPTH_LIMIT: number,
  REDIS: {
    Host: string,
    Port: number,
    DB: number,
    Store_DB: number,
    Password: string
  },
  FINACIAL: {
    initBalance: number,
    addedBalance: number;
    bnb: number,
    bnbPrice: number
  },
  MONGODB: {
    arbitrage: {
      name: string,
      db: string,
      connectionString: string
    },
    loan: {
      name: string,
      db: string,
      connectionString: string
    }
  },
  HOST: string
}