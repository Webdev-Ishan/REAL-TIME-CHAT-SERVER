import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import DbConnect from "./Config/mongoDb.js";
import cors from "cors";
import authRouter from "./Routes/auth.Routes.js";
import cloudConfig from "./Config/cloudinary.js";
import User from "./Models/user.Model.js";
import messageModel from "./Models/messages.model.js";
import http from "http";
import { Server } from "socket.io";

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

// to find the messages by the room and fetch thme according to date
const getlastmessages = async (room) => {
  let messages = await messageModel.aggregate([
    { $match: { to: room } },
    { $group: { _id: "$date", messagesByDate: { $push: "$$ROOT" } } },
  ]);

  return messages;
};

// arrnge them according to the date
function sortRoomMessagesByDate(messages) {
  return messages.sort(function (a, b) {
    let date1 = a._id.split("/");
    let date2 = b._id.split("/");

    date1 = date1[2] + date1[0] + date1[1];
    date2 = date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1;
  });
}

io.on("connection", (socket) => {
  socket.on("new-user", async () => {
    let members = await User.find({});
    io.emit("new-member", members);
  });

  socket.on("join-room", async (newroom, previousroom) => {
    socket.join(newroom);
    socket.leave(previousroom);
    let previouschat = await getlastmessages(newroom);
    let roomMessages = sortRoomMessagesByDate(previouschat);
    socket.emit("room-messages", roomMessages);
  });

  socket.on("message-room", async (room, sender, time, date, content) => {
    let newMessage = await messageModel.create({
      from: sender,
      time,
      date,
      content,
      to: room,
    });
    let previouschat = await getlastmessages(room);
    let roomMessages = sortRoomMessagesByDate(previouschat);

    io.to(room).emit("room-messages", roomMessages);
    socket.broadcast.emit("notifications", room);
  });
});




server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
