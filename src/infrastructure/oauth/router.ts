import KoaRouter, { IRouterContext } from "koa-router";
import passport from "koa-passport"


export const router = new KoaRouter();


export function OAuthRouter(app: any) {
  // Google
  router.get("/oauth/google", passport.authorize("google", {scope: ["openid", "profile", "email"]}));
  router.get("/oauth/google/callback",
    passport.authenticate(
      "google",
      {
        failureRedirect: "/oauth/failure"
      }
    ),
    (req, res) => {
      // req.redirect(`/tmp`);
      req.redirect(`/auth/success?id=${req.state.user.uuid}`)
    }
  );

  // Facebook
  router.get(
    "/oauth/facebook",
    passport.authorize("facebook", {scope: ["public_profile", "email"]})
  );
  router.get(
    "/oauth/facebook/callback",
    passport.authenticate(
      "facebook",
      {failureRedirect: "/auth/failure", failureFlash: true}),
    (ctx, next) => {
      // ctx.redirect(`/tmp`);
      ctx.redirect(`/auth/success?id=${ctx.state.user.uuid}`)
    }
  );

  router.get("/oauth/failure", (ctx: IRouterContext, next: any) => {
    console.error(ctx.req)
  });

  app.use(router.routes()).use(router.allowedMethods())
}

