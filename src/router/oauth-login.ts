import KoaRouter, {IRouterContext} from "koa-router";

import passport from "koa-passport"
import {Next} from "koa";


const router = new KoaRouter();


export function OAuthRouter(app: any) {
  // Google
  router.get("/oauth/google", passport.authorize("google", {scope: ["openid", "profile", "email"]}));
  router.get("/oauth/google/callback",
    passport.authorize(
      "google",
      {failureRedirect: "/oauth/fail"}
    ),
    (req: IRouterContext, res) => {
      console.log('1', req)
      console.log('2', res)
      req.redirect(`/oauth/success?id=${req.state.user.id}`)
    }
  );

  // Facebook
  router.get("/oauth/facebook", passport.authorize("facebook", {scope: ["public_profile", "email"]}));
  router.get("/oauth/facebook/callback",
    passport.authorize(
      "facebook",
      {failureRedirect: "/oauth/fail"}
    ),
    (ctx, next) => {
      ctx.redirect(`/oauth/success?id=${ctx.state.user.id}`)
    }
  );

  // Twitter
  router.get("/oauth/twitter", passport.authorize("twitter", {scope: ["openid", "profile", "email"]}));
  router.get("/oauth/twitter/callback",
    passport.authorize(
      "google",
      {failureRedirect: "/oauth/fail"}
    ),
    (ctx, next) => {
      ctx.redirect(`/oauth/success?id=${ctx.state.user.id}`)
    }
  );

  router.get("/oauth/fail", () => {
    return "auth error"
  });
  router.get("/oauth/success", async (ctx, next) => {
    ctx.body = `hello ${ctx.query.id}`
  });

  app.use(router.routes()).use(router.allowedMethods())
}

