import { Router } from "express"
import groupController from "../controllers/group.controller.mjs"
import { AuthUser } from "../middlewares/Auth.mjs"

const groupRoute = Router()

groupRoute.post("/", AuthUser, groupController.createGroup)
groupRoute.post("/add/user", AuthUser, groupController.addUser)
groupRoute.delete("/exit", AuthUser, groupController.exitGroup)

export default groupRoute