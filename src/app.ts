// @ts-ignore
import config from "config";
import Koa from "koa";
import logger from "koa-logger";
import bodyParser from "koa-bodyparser";
import serve from "koa-static";
import {routerLoader} from "@src/infrastructure/router/loader";
import {dbConnect} from "./infrastructure/mongo";
import http from "http";
import {logger as serviceLogger} from "./infrastructure/logger";
import {loaderPassport} from "./infrastructure/oauth_login";
import {OAUTH} from "@src/infrastructure/utils/constants";
import {OAuthRouter} from "@src/router/oauth-login";
import {createSocket} from "./infrastructure/socket";
import {loadSocketService} from "./services/socket";
import passport from "koa-passport"

import session from "koa-session";
import {initSequence} from "@src/infrastructure/utils/sequence";
const cors = require("@koa/cors");

async function bootstrap() {
  await dbConnect();
  await initSequence();
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
  app.use(bodyParser());
  app.use(cors({
    "origin": config.CORS.origin,
  }));
  app.use(serve("./static"));
  routerLoader(app);

  app.keys = ["secret"];
  app.use(session({}, app));
  // OAuth
  loaderPassport([OAUTH.TWITTER, OAUTH.GOOGLE, OAUTH.FACEBOOK]);
  app.use(passport.initialize());
  app.use(passport.session());
  OAuthRouter(app);

  // websocket
  const server = http.createServer(app.callback());
  loadSocketService(createSocket(server));

  app.proxy = true;
  server.listen(Number(config.HTTPS_PORT), "0.0.0.0", () => serviceLogger.info(`Server started at http://localhost:${config.HTTPS_PORT}`));

}

bootstrap();
