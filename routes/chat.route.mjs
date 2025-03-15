import { Router } from "express";
import chatController from "../controllers/chat.controller.mjs";

const chatRoute = Router()

chatRoute.post("/", chatController.chats)
chatRoute.get("/:id", chatController.chatList)

export default chatRoute