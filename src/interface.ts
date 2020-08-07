import {OAUTH} from "@src/infrastructure/utils/constants";

export type Profile = {
  [key in OAUTH]: GoogleProfile | FaceBookProfile;
};

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
  displayName?: string,
  emails?: { value: string, verified: boolean }[],
  photos?: {value: string}[],
  provider?: string
}


interface  t {
  OAUTH: GoogleProfile
}
