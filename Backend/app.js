import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import DbConnect from "./Config/mongoDb.js";
import cors from "cors";
import authRouter from "./Routes/auth.Routes.js";
import cloudConfig from "./Config/cloudinary.js";
import http from "http";
import { Server } from "socket.io";
import { Livechat } from "./Services/Socket.js";

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

DbConnect();
cloudConfig();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/auth", authRouter);

await Livechat(app);

server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
