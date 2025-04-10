import { Router } from "express";
import userController from "../controllers/user.controller.mjs";
import { AuthUser } from "../middlewares/Auth.mjs";

const userRoute = Router()

userRoute.post("/", userController.userLogin)
userRoute.get("/", AuthUser, userController.getList)
userRoute.get("/search", AuthUser, userController.search)
userRoute.get("/search-for-group", AuthUser, userController.searchForAddUser)
userRoute.patch("/:id", AuthUser, userController.updateUsername)

export default userRoute