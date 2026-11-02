import express ,{type Router}from "express"
import userController from "../Controllers/user.controller.js"

const UserRouter:Router = express.Router()

UserRouter.get("",userController)

export default UserRouter