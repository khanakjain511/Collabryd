import userModel from "../Models/user.model.js"
import type { Request, Response } from "express";

export default async function (req:Request,res:Response) {
    const data = await userModel()
    res.send({data:data})
}