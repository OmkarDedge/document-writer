import { Server } from "socket.io";
import dotenv from "dotenv";
import Connection from "./database/db.js";
import {
  getDocument,
  updateDocument,
} from "./controllers/documentController.js";

dotenv.config();

const PORT = 9000;

Connection();

const io = new Server(PORT, {
  cors: {
    origin: "https://document-writer-frontend.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const doc = await getDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", doc.data);
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("recieve-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await updateDocument(documentId, data);
    });
  });
});
