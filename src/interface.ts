import {OAUTH} from "@src/infrastructure/utils/constants";


export interface Profile {
  [OAUTH.GOOGLE] : GoogleProfile,
  [OAUTH.FACEBOOK]: FaceBookProfile,
  [OAUTH.TWITTER] : GoogleProfile
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
  photos?: {value: string}[],
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
  page:number,
  size: number
}

export interface VideoAmazonUrl {
  screenshot: string,
  low: string,
  hd: string
}

export interface ImageAmazonUrl {
  url: string
}
