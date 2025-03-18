import { Router } from "express";
import userController from "../controllers/user.controller.mjs";

const userRoute = Router()

userRoute.post("/", userController.userLogin)
userRoute.get("/", userController.getList)
userRoute.get("/search", userController.search)
userRoute.patch("/:id", userController.updateUsername)

export default userRoute