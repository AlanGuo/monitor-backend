import config from "@src/infrastructure/utils/config";
import Koa from "koa";
import http from "http";
import logger from "koa-logger";
import bodyParser from "koa-bodyparser";
import serve from "koa-static";
import {routerLoader} from "@src/infrastructure/router/loader";
import {dbConnect} from "./infrastructure/mongo";
import {logger as serviceLogger} from "./infrastructure/logger";
import {SESSION_KEY, SESSION_OVERDUE_SECOND} from "@src/infrastructure/utils/constants";
import passport from "koa-passport"
import session from "koa-generic-session"
import {loadRedisStore} from "@src/infrastructure/redisStore";
async function bootstrap() {
  await dbConnect();
  const app = new Koa();

  /** Middlewares */
  app.use(logger());
  // parse messages for amazon sns
  app.use(async (ctx, next) => {
    if (ctx.request.get("x-amz-sns-message-type")) {
      ctx.request.headers["content-type"] = "application/json";
    }
    await next();
  });
  app.use(function (ctx, next) {
    ctx.flash = (type: string, msg: string) => {
      ctx.session.flash = {type: type, message: msg};
    };
    return next();
  });
  app.use(bodyParser());
  app.use(serve("./static"));
  app.use(session({
    store: await loadRedisStore(),
    key: SESSION_KEY,
    cookie: {
      // httpOnly: true,
      // sameSite: "strict",
      maxAge: process.env.NODE_ENV === "dev" ? 
      SESSION_OVERDUE_SECOND * 10 : 
      SESSION_OVERDUE_SECOND
    }
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  routerLoader(app);
  // websocket
  const server = http.createServer(app.callback());
  app.proxy = true;
  server.listen(Number(config.HTTPS_PORT), "0.0.0.0", () => serviceLogger.info(`Server started at http://localhost:${config.HTTPS_PORT}`));

}

bootstrap();
