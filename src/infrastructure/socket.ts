import socket from "socket.io";
import { Server } from "http";

let io:socket.Server;

export function createSocket(server: Server){
  io = socket(server, {origins: "*:*"});
  return io;
}

export function getSocketIO(): SocketIO.Server{
  if (io) {
    return io;
  } else {
    throw "socket io does not exist"
  }
}