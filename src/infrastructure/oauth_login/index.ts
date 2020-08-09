// @ts-ignore
import config from "config";
import {Strategy as FacebookStrategy} from "passport-facebook"
import {OAuth2Strategy as GoogleStrategy} from "passport-google-oauth"
import {Strategy as TwitterStrategy} from "passport-twitter"
import UserModel from "../../models/user";
import passport from "koa-passport"
import {OAUTH} from "../utils/constants"
import {GoogleProfile, User} from "@src/interface";
import {getUserSequence} from "../utils/sequence";

export function loaderPassport(oauthList: OAUTH[]) {

  passport.serializeUser((user: any, cb) => {
    console.log('serializeUser');
    console.log(JSON.stringify(user))
    cb(null, user.uuid)
  });

  passport.deserializeUser((uuid, cb) => {
    console.log('deserializeUser');
    console.log(JSON.stringify(uuid))
    cb(null, {uuid})
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
      (req, accessToken, refreshToken, profile, cb) => {
        if (!req.user) {
          // TODO Not logged-in
        } else {
          // TODO  Logged in. Associate Facebook account with user
        }
        return cb(null, profile)
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
        if (!req.user) {
          const googleProfile: GoogleProfile = profile._json as GoogleProfile;
          const user = await findOrCreateUser(OAUTH.GOOGLE, googleProfile);
          console.log('====new user')
          cb(null, user)
        } else {
          cb(null, req.user)
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

export async function findOrCreateUser(provider: OAUTH, profile: GoogleProfile): Promise<User> {
  let filter;
  let update;
  switch (provider) {
    case OAUTH.GOOGLE:
      filter = {google: profile.id};
      update =  {$setOnInsert: {google: profile.id}, $set: {}};
      break;
    case OAUTH.TWITTER:
      filter = {twitter: profile.id};
      update =  {$setOnInsert: {google: profile.id}, $set: {}};
      break;
    case OAUTH.FACEBOOK:
      filter = {google: profile.id};
      update =  {$setOnInsert: {google: profile.id}, $set: {}};
      break;
    default:
      throw Error('provider not exists')
  }
  const tmp = await UserModel.findOneAndUpdate(
    filter, update, {new: true, upsert: true, rawResult: true}
  );
  if (!tmp.lastErrorObject.updatedExisting) {
    tmp.value!.uuid = await getUserSequence();
    tmp.value!.save()
  }
  return tmp.value as User
}

async function bindUser(provider: OAUTH, profile: GoogleProfile, user: typeof UserModel) {

}
