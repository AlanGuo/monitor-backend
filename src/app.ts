import Koa from "koa";
import logger from "koa-logger";
import bodyParser from "koa-bodyparser";
import KoaRouter from "koa-router";
import serve from "koa-static";
import { Router } from "./router";
import { dbConnect } from "./infrastructure/db";
import socket from "socket.io";
import http from "http";
import { logger as serviceLogger } from "./infrastructure/logger";

const { HTTPS_PORT } = process.env;
const cors = require("@koa/cors");

async function bootstrap() {
  await dbConnect();
  const app = new Koa();
  const router = new KoaRouter({prefix: "/api"});

  Router(router);
  /** Middlewares */
  app.use(logger());
  app.use(bodyParser());
  app.use(cors({
    "credentials": true
  }));
  app.use(serve("./static"));

  /** Routes */
  app.use(router.routes()).use(router.allowedMethods());

  // websocket
  const server = http.createServer(app.callback());
  const io = socket(server);

  io.on("connection", function(socket){
    console.log("a user connected");
    socket.on("chatMessage", (msg) => {
      io.emit("chatMessage", msg);
    });
  });

  server.listen( Number(HTTPS_PORT), "0.0.0.0", () => serviceLogger.info( `Server started at http://localhost:${HTTPS_PORT}` ) );

}

bootstrap();
