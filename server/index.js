import { Server } from "socket.io";
import dotenv from "dotenv";
import Connection from "./database/db.js";
import {
  getDocument,
  updateDocument,
} from "./controllers/documentController.js";
import express from "express";
import { createServer } from "http";
import cors from 'cors';


dotenv.config();

const PORT = process.env.PORT || 9000;

Connection();

const app = express();

app.use(cors({
  origin: 'https://document-writer-frontend.vercel.app'
}));

const httpserver = createServer(app);
httpserver.listen(PORT);

const io = new Server(httpserver, {
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
