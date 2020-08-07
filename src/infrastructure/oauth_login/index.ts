// @ts-ignore
import config from "config";
import {Strategy as FacebookStrategy} from "passport-facebook"
import {OAuth2Strategy as GoogleStrategy} from "passport-google-oauth"
import {Strategy as TwitterStrategy} from "passport-twitter"
import UserModel from "../../models/user";
import passport from "koa-passport"
import {OAUTH} from "../utils/constants"
import {GoogleProfile, User} from "@src/interface";
import {Schema, Types, model, Document} from "mongoose";
import {query} from "express";

export function loaderPassport(oauthList: OAUTH[]) {

  passport.serializeUser((user: any, cb) => {
    console.log('serializeUser');
    cb(null, user)
  });

  passport.deserializeUser((id, cb) => {
    console.log('deserializeUser');
    const user = {_id: id};
    cb(null, user)
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

export async function findOrCreateUser(provider: OAUTH, profile: GoogleProfile) {
  let filter;
  let update;
  switch (provider) {
    case OAUTH.GOOGLE:
      filter = {google: profile.id};
      update =  {$setOnInsert: {google: profile.id}, $set: {}};
      // const oid = Types.ObjectId();
      // const uuid = parseInt(oid.toHexString().substr(18), 16) + 10000000;
      // const tmp = await UserModel.findOneAndUpdate(
      //   {google: profile.id},
      //   {$setOnInsert: {google: profile.id, uuid}, $set: {}},
      //   {new: true, upsert: true, rawResult: true}
      //   );
      // user = tmp.value as User;
      break;
    case OAUTH.TWITTER:
      filter = {google: profile.id};
      update =  {$setOnInsert: {google: profile.id}, $set: {}};
      break;
    case OAUTH.FACEBOOK:
      filter = {google: profile.id};
      update =  {$setOnInsert: {google: profile.id}, $set: {}};
      break;
    default:
      throw Error('provider not exists')
  }

  const session = await UserModel.db.startSession();
  try {
    await session.withTransaction(async (session) => {
      const count = await UserModel.countDocuments().session(session);
      const uuid = 10000000 + count;
      const user = await UserModel.findOneAndUpdate(
        {google: profile.id},
        {$setOnInsert: {google: profile.id, uuid}, $set: {}},
        {new: true, upsert: true, session}
      ) as User;

    });

  } catch (e) {
    console.log(e)
  }
}

async function bindUser(provider: OAUTH, profile: GoogleProfile, user: typeof UserModel) {

}
