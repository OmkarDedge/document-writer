import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import Connection from "./database/db.js";
import {
  getDocument,
  updateDocument,
} from "./controllers/documentController.js";

dotenv.config();

const PORT = process.env.PORT || 9000;

Connection();

const app = express();

app.use(cors({
  origin: 'https://document-writer-frontend.vercel.app', // Ensure this matches your frontend URL
  methods: ["GET", "POST"], // Allow methods as needed
  credentials: true // Enable credentials if required
}));

const httpserver = createServer(app);

const io = new Server(httpserver, {
  cors: {
    origin: "https://document-writer-frontend.vercel.app", // Ensure this matches your frontend URL
    methods: ["GET", "POST"],
    credentials: true
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

httpserver.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
