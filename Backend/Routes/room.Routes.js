import express from "express";
const roomRouter = express.Router();
import * as roomController from "../Controller/socket.controller.js";
import { authUser } from "../Middleware/auth.midlleware.js";
import { chatUser } from "../Middleware/chat.middleware.js";

roomRouter.get("/findroom", authUser, roomController.findRoom);
roomRouter.post("/delete/:id", chatUser, roomController.deleteMessage);
export default roomRouter;
