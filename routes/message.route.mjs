import { Router } from "express"
import messageController from "../controllers/message.controller.mjs"
import { upload } from "../middlewares/multer.mjs"

const messageRoute = Router()

messageRoute.get("/:chat_id", messageController.messages)
messageRoute.post("/", messageController.sendMessage)
messageRoute.delete("/:id", messageController.deleteMessage)
messageRoute.post("/upload", upload.array("file"), messageController.uploadFile)

export default messageRoute