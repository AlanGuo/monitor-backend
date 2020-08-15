import KoaRouter, { IRouterContext } from "koa-router";
import passport from "koa-passport"


export const router = new KoaRouter();


export function OAuthRouter(app: any) {
  // Google
  router.get("/oauth/google", passport.authorize("google", {scope: ["openid", "profile", "email"]}));
  router.get("/oauth/google/callback",
    // passport.authenticate(
    //   "google",
    //   {
    //     failureRedirect: "/auth/failure"
    //   }
    // ),
    // (req, res) => {
    //   // req.redirect(`/tmp`);
    //   req.redirect(`/auth/success?id=${req.state.user.uuid}`)
    // }
    async (ctx: IRouterContext, next: any) => {
      return new Promise((res, rej) => {
        passport.authenticate("google", (err, user, info) => {
          console.log(err, user, info)
        })(ctx, next);
      });
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
      {failureRedirect: "/auth/failure"}),
    (ctx, next) => {
      // ctx.redirect(`/tmp`);
      ctx.redirect(`/auth/success?id=${ctx.state.user.uuid}`)
    }
  );

  app.use(router.routes()).use(router.allowedMethods())
}

