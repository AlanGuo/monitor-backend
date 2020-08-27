// @ts-ignore
import config from "config";
import {delOnlineUser, getOnlineUser, redis, setOnlineUser} from "../infrastructure/redis";
import socket from "socket.io";
import {
  JUSTFANS_EXCHANGE,
  MESSAGE_ROUTING_KEY,
  RABBITMQ_EXCHANGE_TYPE,
  SESSION_KEY,
  SOCKET_CHANNEL
} from "@src/infrastructure/utils/constants";
import {isVideo} from "@src/infrastructure/utils/video";
import {isImage} from "@src/infrastructure/utils/image";
import cookie from "cookie"
import {loadRedisStore} from "@src/infrastructure/redisStore";
import {SocketAddUser} from "@src/infrastructure/socket";
import UserModel from "../models/user";
import {Producer} from "@src/infrastructure/rabbitMq";

const store = loadRedisStore();

export async function loadSocketService(io: socket.Server) {

  const messageProducer = new Producer(MESSAGE_ROUTING_KEY, JUSTFANS_EXCHANGE);
  await messageProducer.connection(config.RABBITMQ, RABBITMQ_EXCHANGE_TYPE.DIRECT);

  io.use(async (socket: socket.Socket, next) => {
    if (!socket.handshake.headers.cookie) {
      return next(new Error(`Didn't receive cookies`));
    }
    let cookies = cookie.parse(socket.handshake.headers.cookie);
    const session = await store.get("koa:sess:" + cookies[`${SESSION_KEY}`]);
    if (session) {
      if (await UserModel.findOne({uuid: session.passport.user.uuid})) {
        (socket as SocketAddUser).user = session.passport.user;
        await setOnlineUser(session.passport.user.uuid, socket.id);
        return next()
      } else {
        next(new Error(`user not exists`));
      }
    } else {
      next(new Error(`session has been expires`));
    }
  });

  io.on("connection", function (socket: SocketAddUser) {

    socket.on(SOCKET_CHANNEL.CHAT_MESSAGE, async (msg: string) => {
      // when "to" exists then publish the msg to mq
      const tmp = JSON.parse(msg);
      tmp.from = socket.user.uuid;
      if (tmp.to && UserModel.exists({uuid: tmp.to})) {
        await messageProducer.publish(JSON.stringify(tmp));
      }
    });

    // 媒体转换通知
    socket.on(SOCKET_CHANNEL.MEDIA_CONVERTED, async (msg: string) => {
      // TODO
      // 客户端进行了媒体转换
      const {socketId, key, purpose}: { socketId: string, key: string, purpose: string } = JSON.parse(msg);
      const ext = key.split(".")[1];
      let type = "", confKey = "";
      if (isVideo(ext)) {
        type = "Video";
        confKey = purpose + type + "Folder";
      } else if (isImage(ext)) {
        type = "Image";
        confKey = "imageFolder";
      }
      const fileNameWithoutExt = key.split(".")[0].replace(config.AWS_MEDIA_CONVERT[type.toLowerCase() + "SourceFolder"], "");
      const data = await redis.get(config.AWS_MEDIA_CONVERT[confKey] + fileNameWithoutExt);
      if (data) {
        const decodedData = JSON.parse(data);
        decodedData.subscribers.push(socket.user.uuid);
        await redis.set(config.AWS_MEDIA_CONVERT[confKey] + fileNameWithoutExt, JSON.stringify(decodedData));
      }
    });

    socket.on("disconnect", async (msg: string) => {
      await delOnlineUser(socket.user.uuid.toString());
    })
  });
}
