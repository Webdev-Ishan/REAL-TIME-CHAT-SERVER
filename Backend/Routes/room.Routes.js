import express from "express";
const roomRouter = express.Router();
import * as roomController from "../Controller/socket.controller.js";
import { authUser } from "../Middleware/auth.midlleware.js";

roomRouter.get("/findroom", authUser, roomController.findRoom);

export default roomRouter;
