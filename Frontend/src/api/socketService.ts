import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    const rawUrl =
      import.meta.env.VITE_AXIOS_BASE_URL || "http://localhost:3001";
    try {
      const urlObj = new URL(rawUrl);
      this.url = urlObj.origin;
    } catch {
      this.url = "http://localhost:3001";
    }
  }

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.url, {
        withCredentials: true,
      });

      this.socket.on("connect", () => {
        console.log("Connected to socket server");
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from socket server");
      });
    }
    return this.socket;
  }

  public emit(event: string, payload: any) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit(event, payload);
  }

  public on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on(event, callback);
  }

  public joinRoom(roomId: string) {
    this.emit("join-room", roomId);
  }

  public leaveRoom(roomId: string) {
    this.emit("leave-room", roomId);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
