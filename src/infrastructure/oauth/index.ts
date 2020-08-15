// @ts-ignore
import config from "config";
import {Strategy as FacebookStrategy} from "passport-facebook"
import {OAuth2Strategy as GoogleStrategy} from "passport-google-oauth"
import {Strategy as TwitterStrategy} from "passport-twitter"
import UserModel from "../../models/user";
import passport from "koa-passport"
import {OAUTH} from "../utils/constants"
import {FaceBookProfile, GoogleProfile, User} from "@src/interface";
import {getUserSequence} from "../utils/sequence";
import {generateToken} from "@src/infrastructure/utils/auth";

export function loaderPassport(oauthList: OAUTH[]) {

  passport.serializeUser(async (user: User, cb) => {
    const token = await generateToken(user.uuid);
    cb(null, {token, uuid: user.uuid})
  });

  passport.deserializeUser((info, cb) => {
    cb(null, info)
  });

  oauthList.forEach(item => {
    switch (item) {
      case OAUTH.FACEBOOK:
        addFaceBookStrategy();
        break;
      case OAUTH.GOOGLE:
        addGoogleStrategy();
        break;
      case OAUTH.TWITTER:
        addTwitterStrategy();
        break;
      default:
        throw Error(`not support ${item} oauth`)
    }
  })
}

function addFaceBookStrategy() {
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.FACEBOOK.Client_Id,
        clientSecret: config.FACEBOOK.Client_Secret,
        callbackURL: `${config.HOST}/oauth/facebook/callback`,
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, cb) => {
        delete profile._json;
        delete profile._raw;
        const facebookProfile: FaceBookProfile = profile as FaceBookProfile;
        if (!req.user) {
          const user = await findOrCreateUser(OAUTH.FACEBOOK, facebookProfile);
          cb(null, user)
        } else {
          const user = await bindUser(OAUTH.FACEBOOK, facebookProfile, (req.user as { uuid: number }).uuid);
          cb(null, user)
        }
      }
    )
  );
}

function addGoogleStrategy() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.GOOGLE.Client_Id,
        clientSecret: config.GOOGLE.Client_Secret,
        callbackURL: `${config.HOST}/oauth/google/callback`,
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, cb) => {
        delete profile._json;
        delete profile._raw;
        const googleProfile: GoogleProfile = profile as GoogleProfile;
        try {
          if (!req.user) {
            const user = await findOrCreateUser(OAUTH.GOOGLE, googleProfile);
            cb(null, user)
          } else {
            const user = await bindUser(OAUTH.GOOGLE, googleProfile, (req.user as { uuid: number }).uuid);
            cb(null, user)
          }
        } catch (e) {
          console.error(e);
          cb(null, null, {message: e.message})
        }
      }
    )
  );
}

function addTwitterStrategy() {
  passport.use(
    new TwitterStrategy(
      {
        consumerKey: "213",
        consumerSecret: "123",
        callbackURL: `${config.HOST}/oauth/twitter/callback`,
        passReqToCallback: true
      },
      (req, token, tokenSecret, profile, cb) => {
        if (!req.user) {
          // TODO Not logged-in
        } else {
          // TODO  Logged in. Associate Twitter account with user
        }
        return cb(null, profile)
      }
    )
  );
}

export async function findOrCreateUser(provider: OAUTH, profile: GoogleProfile | FaceBookProfile): Promise<User> {
  let filter;
  let update;
  switch (provider) {
    case OAUTH.GOOGLE:
      filter = {google: profile.id};
      const emails = (profile as GoogleProfile).emails;
      const photos = (profile as GoogleProfile).photos;
      update = {$setOnInsert: {google: profile.id}, $set: {
        "oauthProfile.google": profile,
        "email": emails ? emails[0]?.value : "",
        "avatar": photos ? photos[0]?.value : "",
        "displayName": profile.displayName
      }};
      break;
    case OAUTH.FACEBOOK:
      filter = {facebook: profile.id};
      //need to do 
      update = {$setOnInsert: {facebook: profile.id}, $set: {"oauthProfile.facebook": profile}};
      break;
    default:
      throw Error("provider not exists")
  }
  const tmp = await UserModel.findOneAndUpdate(
    filter, update, {new: true, upsert: true, rawResult: true}
  );
  if (!tmp.lastErrorObject.updatedExisting) {
    tmp.value!.uuid = await getUserSequence();
    await tmp.value!.save()
  }
  return tmp.value as User
}

export async function bindUser(provider: OAUTH, profile: GoogleProfile | FaceBookProfile, uuid: number): Promise<User> {
  let filter;
  let update;
  let oauth;
  switch (provider) {
    case OAUTH.GOOGLE:
      oauth = {google: profile.id};
      filter = {uuid};
      update = {$set: {"oauthProfile.google": profile, google: profile.id}};
      break;
    case OAUTH.FACEBOOK:
      oauth = {facebook: profile.id};
      filter = {uuid};
      update = {$set: {"oauthProfile.facebook": profile, facebook: profile.id}};
      break;
    default:
      throw Error("provider not exists")
  }
  const oauthExists = await UserModel.findOne(oauth);
  if (oauthExists && oauthExists.uuid !== uuid) {
    throw Error(`${provider} account has been used`)
  }
  const user = await UserModel.findOneAndUpdate(filter, update);
  if (user) {
    return user as User
  } else {
    throw Error("user not exists")
  }

}
