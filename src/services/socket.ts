// @ts-ignore
import config from "config";
import { redis } from "../infrastructure/redis"; 
import socket from "socket.io";
import { SOCKET_CHANNEL } from "@src/infrastructure/utils/constants";

export function loadSocketService(io: socket.Server) {
  io.on("connection", function (socket: socket.Server) {
    socket.on("chatMessage", (msg: string) => {
      io.emit("chatMessage", msg);
    });
    // 媒体转换通知
    socket.on(SOCKET_CHANNEL.MEDIA_CONVERTED, async ({socketId, key, purpose}: {socketId:string, key:string, purpose:string}) => {
      const fileNameWithoutExt = key.split(".")[0];
      const data = await redis.get(config.AWS_MEDIA_CONVERT[ purpose + "_media_folder" ] + fileNameWithoutExt);
      if (data) {
        const decodedData = JSON.parse(data);
        decodedData.subscribers.push(socketId);
        await redis.set(config.AWS_MEDIA_CONVERT[ purpose + "_media_folder" ] + fileNameWithoutExt, JSON.stringify(decodedData));
      }
    });
  });
}