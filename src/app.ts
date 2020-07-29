import Koa from "koa";
import logger from "koa-logger";
import bodyParser from "koa-bodyparser";
import serve from "koa-static";
import { routerLoader } from "@src/infrastructure/router/loader";
import { dbConnect } from "./infrastructure/mongo";
import socket from "socket.io";
import http from "http";
import { logger as serviceLogger } from "./infrastructure/logger";

const { HTTPS_PORT } = process.env;
const cors = require("@koa/cors");

async function bootstrap() {
  await dbConnect();
  const app = new Koa();
  
  /** Middlewares */
  app.use(logger());
  app.use(bodyParser());
  app.use(cors({
    "credentials": true
  }));
  app.use(serve("./static"));
  routerLoader(app);
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
