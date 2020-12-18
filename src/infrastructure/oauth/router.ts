import KoaRouter from "koa-router";
import passport from "koa-passport"
import {jsonResponse} from "@src/infrastructure/utils";
import {delOnlineUser, getOnlineUser} from "@src/infrastructure/redis";
import {getSocketIO} from "@src/infrastructure/socket";
import {SESSION_KEY} from "@src/infrastructure/utils/constants";
import {loadRedisStore} from "@src/infrastructure/redisStore";


export const router = new KoaRouter();
const failureRedirect = "/auth/failure";
const store = loadRedisStore();

export function OAuthRouter(app: any) {
  // Google
  router.get("/oauth/google", passport.authorize("google", {scope: ["openid", "profile", "email"]}));
  router.get("/oauth/google/callback",
    passport.authenticate("google", {failureRedirect, failureMessage: true, failWithError: true}),
    (req, next) => {
      req.redirect(`/auth/success?id=${req.state.user.uuid}`)
    }
  );

  // Facebook
  router.get("/oauth/facebook", passport.authorize("facebook", {scope: ["public_profile", "email"]}));
  router.get(
    "/oauth/facebook/callback",
    passport.authenticate("facebook", {failureRedirect, failureFlash: true}),
    (ctx, next) => {
      ctx.redirect(`/auth/success?id=${ctx.state.user.uuid}`)
    }
  );

  router.get("/oauth/logout", async (ctx: any) => {
    if (ctx.state.user) {
      const uuid = ctx.state.user.uuid;
      const sid = await getOnlineUser(uuid);
      if (sid) {
        const io = getSocketIO();
        io.sockets.connected[sid]?.disconnect(true);
        await delOnlineUser(uuid);
      }
      await store.destroy(`koa:sess:${ctx.cookies.get(SESSION_KEY)}`);
      await ctx.logout();
    }
    ctx.body = jsonResponse({data: {auth: await ctx.isAuthenticated()}})
  });

  app.use(router.routes()).use(router.allowedMethods())
}

