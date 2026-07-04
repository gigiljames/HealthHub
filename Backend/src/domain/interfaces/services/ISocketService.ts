import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";

export interface ISocketService {
  initialize(server: HttpServer): void;
  getIO(): Server;
  joinRoom(socket: Socket, roomId: string): void;
  leaveRoom(socket: Socket, roomId: string): void;
  emitToRoom(roomId: string, event: string, payload: object): void;
}
