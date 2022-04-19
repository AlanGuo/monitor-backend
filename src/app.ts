import config from "@src/infrastructure/utils/config";
import Koa from "koa";
import http from "http";
import logger from "koa-logger";
import bodyParser from "koa-bodyparser";
import serve from "koa-static";
import {routerLoader} from "@src/infrastructure/router/loader";
import {dbConnect} from "./infrastructure/mongo";
import {logger as serviceLogger} from "./infrastructure/logger";
async function bootstrap() {
  await dbConnect();
  const app = new Koa();

  /** Middlewares */
  app.use(logger());
  app.use(function (ctx, next) {
    ctx.flash = (type: string, msg: string) => {
      ctx.session.flash = {type: type, message: msg};
    };
    return next();
  });
  app.use(bodyParser());
  app.use(serve("./static"));
  routerLoader(app);
  // websocket
  const server = http.createServer(app.callback());
  app.proxy = true;
  server.listen(Number(config.HTTPS_PORT), "0.0.0.0", () => serviceLogger.info(`Server started at http://localhost:${config.HTTPS_PORT}`));

}

bootstrap();
