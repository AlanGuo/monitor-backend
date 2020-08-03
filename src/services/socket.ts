// @ts-ignore
import config from "config";
import { redis } from "../infrastructure/redis"; 
import socket from "socket.io";

export function loadSocketService(io: socket.Server) {
  io.on("connection", function (socket: socket.Server) {
    socket.on("chatMessage", (msg: string) => {
      io.emit("chatMessage", msg);
    });
    // 媒体转换通知
    socket.on("mediaConverted", (socketId: string, fileName: string) => {
      const fileNameWithoutExt = fileName.split(".")[0];
      const screenshot = config.AWS_S3.prefix + fileNameWithoutExt + config.AWS_S3.screenshot_suffix;
      const low = config.AWS_S3.prefix + fileNameWithoutExt + config.AWS_S3.low_suffix;
      const hd = config.AWS_S3.prefix + fileNameWithoutExt + config.AWS_S3.hd_suffix;
      redis.set(screenshot, JSON.stringify([socketId]));
      redis.set(low, JSON.stringify([socketId]));
      redis.set(hd, JSON.stringify([socketId]));
    });
  });
}