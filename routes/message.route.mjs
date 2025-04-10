import { Router } from "express"
import messageController from "../controllers/message.controller.mjs"
import { upload } from "../middlewares/multer.mjs"
import { AuthUser } from "../middlewares/Auth.mjs"

const messageRoute = Router()

messageRoute.get("/:chat_id", AuthUser, messageController.messages)
messageRoute.post("/", AuthUser, messageController.sendMessage)
messageRoute.delete("/:id", AuthUser, messageController.deleteMessage)
messageRoute.post("/upload", AuthUser, upload.array("file"), messageController.uploadFile)
messageRoute.post("/unread", AuthUser, messageController.incrementUnread)

export default messageRoute