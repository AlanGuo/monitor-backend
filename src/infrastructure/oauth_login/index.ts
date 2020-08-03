// @ts-ignore
import config from "config";
import {Strategy as FacebookStrategy} from "passport-facebook"
import {OAuth2Strategy as GoogleStrategy} from "passport-google-oauth"
import {Strategy as TwitterStrategy} from "passport-twitter"

import passport from "koa-passport"
import {OAUTH} from "../utils/constants"


export function loaderPassport(oauthList: OAUTH[]) {

  passport.serializeUser((user: any, cb) => {
    console.log('4')

    cb(null, user.id)
  });

  passport.deserializeUser(() => {
    console.log('5')

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
      (req, accessToken, refreshToken, profile, cb) => {
        console.log('3')
        console.log(req)
        if (!req.user) {
          // TODO Not logged-in
        } else {
          // TODO  Logged in. Associate Google account with user
        }
        return cb(null, profile)
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

function createUser(provider: OAUTH, profile: any) {
  // TODO
}