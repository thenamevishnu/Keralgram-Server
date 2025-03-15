import { Router } from "express"
import messageController from "../controllers/message.controller.mjs"

const messageRoute = Router()

messageRoute.get("/:chat_id", messageController.messages)
messageRoute.post("/", messageController.sendMessage)

export default messageRoute