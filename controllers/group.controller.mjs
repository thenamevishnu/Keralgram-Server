import { request } from "express"
import { ChatModel } from "../models/chat.model.mjs"
import { UserModel } from "../models/user.model.mjs"
import { MessageModel } from "../models/message.model.mjs"
import { v4 } from "uuid"

const createGroup = async (request, response) => {
    try {
        const { picture, title, owner } = request.body
        if (!title || !owner) {
            return response.status(400).send({
                message: "Invalid Request"
            })
        }
        const obj = { title, owner, users: [owner], chat_type: "group" }
        if(picture) {
            obj.picture = picture
        }
        const group = await ChatModel.create(obj) 
        if(!group?._id) {
            return response.status(400).send({
                message: "Something went wrong"
            })
        }
        return response.status(200).send(group)
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal server error"
        })
    }
}

const addUser = async (request, response) => {
    try {
        const { chat_id, user_id, added } = request.body
        if (!chat_id || !user_id) {
            return response.status(400).send({
                message: "Invalid Request"
            })
        }
        const res = await ChatModel.updateOne({ _id: chat_id }, { $addToSet: { users: user_id } })
        if (res.matchedCount == 1 && res.modifiedCount == 1) {
            const users = await UserModel.find({ _id: { $in: [user_id, added] } })
            const usersInfo = {
                added_by: users.find(u => u._id == added).name,
                new_user: users.find(u=>u._id == user_id).name
            }
            const messageObj = {
                message: usersInfo.added_by + " added " + usersInfo.new_user,
                type: "new_joiner",
                chat_type: "group",
                file_name: null,
                file_size: 0,
                file_extension: "",
                chat_id: chat_id,
                message_id: v4(),
                time: Math.floor(new Date().getTime() / 1000),
                sender: added,
                to: user_id
            }
            const chat = await ChatModel.findOne({ _id: chat_id })
            const usersList = [...chat.users, chat.owner, ...chat.admins]
            await MessageModel.create(messageObj)
            return response.status(200).send({user: users.find(u=>u._id == user_id), chat_users: usersList, messageObj})
        }
        return response.status(200).send(null)
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal server error"
        })   
    }
}

const exitGroup = async (request, response) => {
    try {
        const { chat_id, user_id } = request.query
        if (!chat_id || !user_id) {
            return response.status(400).send({
                message: "Invalid Request"
            })
        }
        const user = await UserModel.findOne({ _id: user_id })
        if(!user) {
            return response.status(400).send({
                message: "Invalid Request"
            })
        }
        const chat = await ChatModel.findOne({ _id: chat_id })
        if(!chat) {
            return response.status(400).send({
                message: "Invalid Request"
            })
        }
        if(chat.owner == user_id) {
            return response.status(400).send({
                message: "Owner can't leave group"
            })
        }
        const res = await ChatModel.updateOne({ _id: chat_id }, { $pull: { users: user_id } })
        if (res.matchedCount == 1 && res.modifiedCount == 1) {
            const chatUsers = [...chat.users, chat.owner, ...chat.admins]
            const messageObj = {
                message: `${user.name} left group`,
                type: "left_group",
                chat_type: "group",
                file_name: null,
                file_size: 0,
                file_extension: "",
                chat_id: chat_id,
                message_id: v4(),
                time: Math.floor(new Date().getTime() / 1000),
                sender: user_id,
                to: user_id
            }
            await MessageModel.create(messageObj)
            return response.status(200).send({chat_users: chatUsers, messageObj})
        }
        return response.status(500).send({message: "Something went wrong"})
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal server error"
        })   
    }
}

export default {
    createGroup, addUser, exitGroup
}