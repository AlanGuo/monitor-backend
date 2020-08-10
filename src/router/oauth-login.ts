import KoaRouter, {IRouterContext} from "koa-router";

import passport from "koa-passport"


const router = new KoaRouter();


export function OAuthRouter(app: any) {
  // Google
  router.get("/oauth/google", passport.authorize("google", {scope: ["openid", "profile", "email"]}));
  router.get("/oauth/google/callback",
    passport.authenticate(
      "google",
      {failureRedirect: "/oauth/fail"}
    ),
    (req, res) => {
      req.redirect(`/oauth/success?id=${req.state.user.uuid}`)
    }
  );

  // Facebook
  router.get(
    "/oauth/facebook",
    passport.authorize("facebook", {scope: ["public_profile", "email"]})
  );
  router.get(
    "/oauth/facebook/callback",
    passport.authorize("facebook", {failureRedirect: "/oauth/fail"}),
    (ctx, next) => {
      ctx.redirect(`/oauth/success?id=${ctx.state.user.uuid}`)
    }
  );


  router.get("/oauth/fail", (ctx) => {
    ctx.body = `auth error: cause ${JSON.stringify(ctx)}`
  });
  router.get("/oauth/success", async (ctx, next) => {
    ctx.body = `hello ${ctx.query.id}`
  });

  app.use(router.routes()).use(router.allowedMethods())
}

