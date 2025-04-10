import { Router } from "express";
import chatController from "../controllers/chat.controller.mjs";
import { AuthUser } from "../middlewares/Auth.mjs";

const chatRoute = Router()

chatRoute.post("/", AuthUser, chatController.chats)
chatRoute.get("/:id", AuthUser, chatController.chatList)
chatRoute.get("/groups/:id", AuthUser, chatController.getGroupChats)
chatRoute.get("/list/active", AuthUser, chatController.getActiveChats)

export default chatRoute