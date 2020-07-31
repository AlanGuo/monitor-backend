import KoaRouter from "koa-router";

import passport from "koa-passport"


const router = new KoaRouter();


export function OAuthRouter(app: any) {
  // Google
  router.get("/oauth/google", passport.authenticate("google", {scope: ["openid", "profile", "email"]}));
  router.get("/oauth/google/callback",
    passport.authenticate(
      "google",
      {failureRedirect: "/oauth/fail"}
    ),
    (ctx, next) => {
      ctx.redirect(`/oauth/success?id=${ctx.state.user.id}`)
    }
  );

  // Facebook
  router.get("/oauth/facebook", passport.authenticate("facebook", {scope: ["public_profile", "email"]}));
  router.get("/oauth/facebook/callback",
    passport.authenticate(
      "facebook",
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

