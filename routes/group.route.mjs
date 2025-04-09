import { Router } from "express"
import groupController from "../controllers/group.controller.mjs"

const groupRoute = Router()

groupRoute.post("/", groupController.createGroup)
groupRoute.post("/add/user", groupController.addUser)
groupRoute.delete("/exit", groupController.exitGroup)

export default groupRoute