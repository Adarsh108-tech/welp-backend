import { Server } from "socket.io";
import Message from "./models/Message.mjs";

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("private-message", async ({ from, to, content }) => {
      try {
        const message = new Message({ senderId: from, receiverId: to, content });
        await message.save();
        io.to(to).emit("private-message", {
          from,
          to,
          content,
          timestamp: message.timestamp,
        });
      } catch (err) {
        console.error("Message saving failed:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.id);
    });
  });
}
