// @ts-ignore
import config from "config";
import {redis} from "../infrastructure/redis";
import socket from "socket.io";
import {SOCKET_CHANNEL} from "@src/infrastructure/utils/constants";
import {isVideo} from "@src/infrastructure/utils/video";
import {isImage} from "@src/infrastructure/utils/image";

export function loadSocketService(io: socket.Server) {
  io.on("connection", function (socket: socket.Socket) {
    console.log("a client is connected");
    console.log(socket.handshake.headers.cookie);
    // TODO auth session
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
    socket.on('disconnect', ()=>{

    })
  });
}
