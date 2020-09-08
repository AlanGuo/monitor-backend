import config from "@src/infrastructure/utils/config";
import socket from "socket.io";
import { Server } from "http";

let io:socket.Server;

export function createSocket(server: Server){
  io = socket(server, {origins: config.WEBSOCKET.origins});
  return io;
}

export function getSocketIO(): SocketIO.Server{
  if (io) {
    return io;
  } else {
    throw "socket io does not exist"
  }
}

export type SocketAddUser = socket.Socket & {user: {uuid: number, token: string}}
