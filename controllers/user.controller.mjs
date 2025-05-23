import { jwtDecode } from "jwt-decode"
import jwt from "jsonwebtoken"
import { UserModel } from "../models/user.model.mjs"
import { ChatModel } from "../models/chat.model.mjs"

const userLogin = async (request, response) => {
    try {
        const { credential } = request.body
        try {
            const decode = jwtDecode(credential)
            const { name, email, picture } = decode
            let user = await UserModel.findOne({ email })
            const username = user ? user.username : email.split("@")[0]
            if (!user) {
                user = await UserModel.create({ name, username, email, picture })
                if (!user?._id) {
                    return response.status(400).send({
                        message: "Invalid Login"
                    })
                }
            }
            if (user.picture != picture) {
                user.picture = picture
                await user.save()
            }
            const token = jwt.sign({ sub: user}, process.env.JWT_SECRET, {
                expiresIn: "7d"
            })
            return response.status(200).send({ token })
        } catch (err) {
            return response.status(400).send({
                message: "Invalid Login"
            })
        }
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })
    }
}

const getList = async (_request, response) => {
    try {
        const users = await UserModel.find()
        return response.status(200).send(users)
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })   
    }
}

const search = async (request, response) => {
    try {
        const { query, id } = request.query
        const res = await UserModel.find({ _id: {$ne: id}, $or: [{ name: { $regex: new RegExp(query, "i") } }, { email: { $regex: new RegExp(query, "i") } }] })
        return response.status(200).send(res)
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })
    }
}

const searchForAddUser = async (request, response) => {
    try {
        const { query, chat_id } = request.query
        const chat = await ChatModel.findOne({ _id: chat_id })
        const res = await UserModel.find({ $and: [{ _id: { $nin: chat.users } }, { _id: { $ne: chat.owner } }, { _id: { $nin: chat.admins } }], $or: [{ name: { $regex: new RegExp(query, "i") } }, { email: { $regex: new RegExp(query, "i") } }] })
        return response.status(200).send(res)
    } catch (err) {
        console.log(err);
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })
    }
}

const updateUsername = async (request, response) => {
    try {
        const { id } = request.params
        const { username } = request.body
        if(!id || !username) {
            return response.status(400).send({
                message: "Invalid Request"
            })
        }
        const res = await UserModel.updateOne({ _id: id }, { $set: request.body })
        return response.status(200).send(res)
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })   
    }
}

export default {
    userLogin,
    getList,
    search,
    updateUsername,
    searchForAddUser
}