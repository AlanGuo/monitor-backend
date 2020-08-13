// @ts-ignore
import config from "config";
import {redis} from "../infrastructure/redis";
import socket from "socket.io";
import {SESSION_KEY, SOCKET_CHANNEL} from "@src/infrastructure/utils/constants";
import {isVideo} from "@src/infrastructure/utils/video";
import {isImage} from "@src/infrastructure/utils/image";
import cookie from 'cookie'
import {loadRedisStore} from "@src/infrastructure/redisStore";
import {SocketAddUser} from "@src/infrastructure/socket";

const store = loadRedisStore();

export function loadSocketService(io: socket.Server) {
  io.use(async (socket: socket.Socket, next) => {
    if (!socket.handshake.headers.cookie) {
      return next(`Didn't receive cookies`);
    }
    let cookies = cookie.parse(socket.handshake.headers.cookie);
    const session = await store.get('koa:sess:' + cookies[`${SESSION_KEY}`]);
    if (session) {
      (socket as SocketAddUser).user = session.passport.user;
      return next()
    } else {
      next(`session has been expires`);
    }
  });

  io.on("connection", function (socket: SocketAddUser) {
    socket.on(SOCKET_CHANNEL.CHAT_MESSAGE, (msg: string) => {
      io.emit(SOCKET_CHANNEL.CHAT_MESSAGE, msg);
    });
    // 媒体转换通知
    socket.on(SOCKET_CHANNEL.MEDIA_CONVERTED, async (msg: string) => {
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
      // console.log("socketKey", config.AWS_MEDIA_CONVERT[ confKey ] + fileNameWithoutExt);
      if (data) {
        const decodedData = JSON.parse(data);
        decodedData.subscribers.push(socketId);
        await redis.set(config.AWS_MEDIA_CONVERT[confKey] + fileNameWithoutExt, JSON.stringify(decodedData));
      }
    });
    socket.on('disconnect', (socket: SocketAddUser) => {
      console.log(socket.user.uuid, 'disconnect')
    })
  });
}
