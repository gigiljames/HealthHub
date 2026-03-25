import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { ISocketService } from "../../domain/interfaces/services/ISocketService";
import { logger } from "../../utils/logger";
import { env } from "../../config/envConfig";
import { MESSAGES } from "../../domain/constants/messages";

class SocketIOService implements ISocketService {
  private io: Server | null = null;

  initialize(server: HttpServer): void {
    if (this.io) {
      logger.warn(MESSAGES.SOCKET.ALREADY_INITIALIZED);
      return;
    }

    this.io = new Server(server, {
      cors: {
        origin: env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
      },
    });

    this.io.on("connection", (socket: Socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      socket.on("join-room", (roomId: string) => {
        this.joinRoom(socket, roomId);
      });

      socket.on("leave-room", (roomId: string) => {
        this.leaveRoom(socket, roomId);
      });

      socket.on("disconnect", () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });

    logger.info(MESSAGES.SOCKET.INITIALIZED);
  }

  getIO(): Server {
    if (!this.io) {
      throw new Error(MESSAGES.SOCKET.NOT_INITIALIZED);
    }
    return this.io;
  }

  joinRoom(socket: Socket, roomId: string): void {
    socket.join(roomId);
    logger.info(`Socket ${socket.id} joined room ${roomId}`);
  }

  leaveRoom(socket: Socket, roomId: string): void {
    socket.leave(roomId);
    logger.info(`Socket ${socket.id} left room ${roomId}`);
  }

  emitToRoom(roomId: string, event: string, payload: any): void {
    this.getIO().to(roomId).emit(event, payload);
    logger.info(`Event ${event} emitted to room ${roomId}`);
  }
}

export const socketService = new SocketIOService();
