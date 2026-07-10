import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { ISocketService } from "../../domain/interfaces/services/ISocketService";
import { logger } from "../../utils/logger";
import { env } from "../../config/envConfig";
import { MESSAGES } from "../../domain/constants/messages";
import { ConsultationRepository } from "../repositories/consultationRepository";
import { authModel } from "../DB/models/authModel";

class SocketIOService implements ISocketService {
  private io: Server | null = null;
  private readonly _consultationRepository = new ConsultationRepository();

  initialize(server: HttpServer): void {
    if (this.io) {
      logger.warn(MESSAGES.SOCKET.ALREADY_INITIALIZED);
      return;
    }

    this._consultationRepository.clearAllSockets().catch((err) => {
      logger.error("Failed to clear socket mappings on startup", err);
    });

    this.io = new Server(server, {
      cors: {
        origin: env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
      },
    });

    this.io.on("connection", (socket: Socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      socket.on("join-room", async (data: { roomId: string, email: string }) => {
        try {
          if (typeof data === "string") {
            socket.join(data);
            logger.info(`Socket ${socket.id} joined personal room ${data}`);
            socket.emit("joined-room", { roomId: data });
            return;
          }

          const { roomId, email } = data;
          if (!roomId || !email) {
            socket.emit("join-error", { message: "Invalid room or email." });
            return;
          }

          const consultation = await this._consultationRepository.findByRoomId(roomId);
          if (!consultation) {
            socket.emit("join-error", { message: "Consultation room not found." });
            return;
          }

          const user = await authModel.findOne({ email }).lean();
          if (!user) {
            socket.emit("join-error", { message: "User not found." });
            return;
          }

          const userIdStr = user._id.toString();
          const isPatient = consultation.patientId.toString() === userIdStr;
          const isDoctor = consultation.doctorId.toString() === userIdStr;

          if (!isPatient && !isDoctor) {
            socket.emit("join-error", { message: "Unauthorized to join this consultation room." });
            return;
          }

          if (isPatient) {
            await this._consultationRepository.updateSocketIds(consultation.id!, {
              patientSocketId: socket.id,
            });
          } else {
            await this._consultationRepository.updateSocketIds(consultation.id!, {
              doctorSocketId: socket.id,
            });
          }

          socket.join(roomId);
          logger.info(`Email ${email} linked with socket ${socket.id} joined room ${roomId}`);
          socket.emit("joined-room", { roomId });
          socket.broadcast.to(roomId).emit("user-joined", { email });
        } catch (error) {
          logger.error("Error joining socket room:", error);
          socket.emit("join-error", { message: "Failed to join room." });
        }
      });

      socket.on("call-user", async (data: { email: string; offer: object }) => {
        try {
          const { offer } = data;
          const consultation = await this._consultationRepository.findBySocketId(socket.id);
          if (!consultation) return;

          const senderIsPatient = consultation.patientSocketId === socket.id;
          const targetSocketId = senderIsPatient
            ? consultation.doctorSocketId
            : consultation.patientSocketId;

          if (targetSocketId) {
            const senderId = senderIsPatient ? consultation.patientId : consultation.doctorId;
            const sender = await authModel.findById(senderId).lean();
            const fromEmail = sender?.email || "";
            socket.to(targetSocketId).emit("incoming-call", { from: fromEmail, offer });
          }
        } catch (error) {
          logger.error("Error in call-user:", error);
        }
      });

      socket.on("call-accepted", async (data: { email: string; answer: object }) => {
        try {
          const { answer } = data;
          const consultation = await this._consultationRepository.findBySocketId(socket.id);
          if (!consultation) return;

          const senderIsPatient = consultation.patientSocketId === socket.id;
          const targetSocketId = senderIsPatient
            ? consultation.doctorSocketId
            : consultation.patientSocketId;

          if (targetSocketId) {
            socket.to(targetSocketId).emit("call-accepted", { answer });
          }
        } catch (error) {
          logger.error("Error in call-accepted:", error);
        }
      });

      socket.on("peer-negotiation-needed", async (data: { email: string; offer: object }) => {
        try {
          const { offer } = data;
          const consultation = await this._consultationRepository.findBySocketId(socket.id);
          if (!consultation) return;

          const senderIsPatient = consultation.patientSocketId === socket.id;
          const targetSocketId = senderIsPatient
            ? consultation.doctorSocketId
            : consultation.patientSocketId;

          if (targetSocketId) {
            const senderId = senderIsPatient ? consultation.patientId : consultation.doctorId;
            const sender = await authModel.findById(senderId).lean();
            const fromEmail = sender?.email || "";
            socket.to(targetSocketId).emit("incoming-negotiation", { from: fromEmail, offer });
          }
        } catch (error) {
          logger.error("Error in peer-negotiation-needed:", error);
        }
      });

      socket.on("peer-negotiation-done", async (data: { email: string; answer: object }) => {
        try {
          const { answer } = data;
          const consultation = await this._consultationRepository.findBySocketId(socket.id);
          if (!consultation) return;

          const senderIsPatient = consultation.patientSocketId === socket.id;
          const targetSocketId = senderIsPatient
            ? consultation.doctorSocketId
            : consultation.patientSocketId;

          if (targetSocketId) {
            socket.to(targetSocketId).emit("peer-negotiation-done", { answer });
          }
        } catch (error) {
          logger.error("Error in peer-negotiation-done:", error);
        }
      });

      socket.on("toggle-audio", async (data: { email: string; muted: boolean }) => {
        try {
          const { muted } = data;
          const consultation = await this._consultationRepository.findBySocketId(socket.id);
          if (!consultation) return;

          const senderIsPatient = consultation.patientSocketId === socket.id;
          const targetSocketId = senderIsPatient
            ? consultation.doctorSocketId
            : consultation.patientSocketId;

          if (targetSocketId) {
            socket.to(targetSocketId).emit("peer-audio-toggled", { muted });
          }
        } catch (error) {
          logger.error("Error in toggle-audio:", error);
        }
      });

      socket.on("ice-candidate", async (data: { email: string; candidate: object }) => {
        try {
          const { candidate } = data;
          const consultation = await this._consultationRepository.findBySocketId(socket.id);
          if (!consultation) return;

          const senderIsPatient = consultation.patientSocketId === socket.id;
          const targetSocketId = senderIsPatient
            ? consultation.doctorSocketId
            : consultation.patientSocketId;

          if (targetSocketId) {
            socket.to(targetSocketId).emit("ice-candidate", { candidate });
          }
        } catch (error) {
          logger.error("Error in ice-candidate forwarding:", error);
        }
      });

      socket.on("leave-call", async () => {
        try {
          const consultation = await this._consultationRepository.findBySocketId(socket.id);
          if (!consultation) return;

          const isPatient = consultation.patientSocketId === socket.id;
          const targetSocketId = isPatient
            ? consultation.doctorSocketId
            : consultation.patientSocketId;

          const userId = isPatient ? consultation.patientId : consultation.doctorId;
          const user = await authModel.findById(userId).lean();
          const fromEmail = user?.email || "";

          if (isPatient) {
            await this._consultationRepository.updateSocketIds(consultation.id!, { patientSocketId: null });
          } else {
            await this._consultationRepository.updateSocketIds(consultation.id!, { doctorSocketId: null });
          }

          if (targetSocketId) {
            socket.to(targetSocketId).emit("user-left", { fromEmail });
          }
        } catch (error) {
          logger.error("Error in leave-call:", error);
        }
      });

      socket.on("leave-room", (roomId: string) => {
        this.leaveRoom(socket, roomId);
      });

      socket.on("chat_typing", (data: { roomId: string; userId: string; name: string; role: "doctor" | "patient"; isTyping: boolean }) => {
        socket.to(data.roomId).emit("chat_typing", data);
      });

      socket.on("disconnecting", async () => {
        try {
          const consultation = await this._consultationRepository.findBySocketId(socket.id);
          if (consultation) {
            const isPatient = consultation.patientSocketId === socket.id;
            const targetSocketId = isPatient
              ? consultation.doctorSocketId
              : consultation.patientSocketId;

            const userId = isPatient ? consultation.patientId : consultation.doctorId;
            const user = await authModel.findById(userId).lean();
            const fromEmail = user?.email || "";

            if (isPatient) {
              await this._consultationRepository.updateSocketIds(consultation.id!, { patientSocketId: null });
            } else {
              await this._consultationRepository.updateSocketIds(consultation.id!, { doctorSocketId: null });
            }

            if (targetSocketId) {
              socket.to(targetSocketId).emit("user-left", { fromEmail });
            }
          }
        } catch (error) {
          logger.error("Error in disconnecting socket cleanup:", error);
        }
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

  emitToRoom(roomId: string, event: string, payload: object): void {
    this.getIO().to(roomId).emit(event, payload);
    logger.info(`Event ${event} emitted to room ${roomId}`);
  }

  emitToUser(userId: string, event: string, payload: object): void {
    this.getIO().to(userId).emit(event, payload);
    logger.info(`Event ${event} emitted to user ${userId}`);
  }
}

export const socketService = new SocketIOService();
