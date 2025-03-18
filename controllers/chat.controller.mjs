import { Types } from "mongoose";
import { ChatModel } from "../models/chat.model.mjs"

const chats = async (request, response) => {
    try {
        const { user1, user2 } = request.body
        if(!user1 || !user2) {
            return response.status(400).send({
                message: "Invalid Request"
            })
        }
        const res = await ChatModel.findOne({ users: { $all: [user1, user2] } })
        if(!res) {
            await ChatModel.create({ users: [user1, user2], last_message: "", last_message_time: 0 })
        }
        const chat = await ChatModel.aggregate([
            {
                $match: {
                    users: { $all: [new Types.ObjectId(user1), new Types.ObjectId(user2)] }
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "users",
                    foreignField: "_id",
                    as: "users_info"
                }
            }
        ])
        return response.status(200).send(chat?.[0])
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })   
    }
}

const chatList = async (request, response) => {
    try {
        const { id } = request.params
        if(!id) {
            return response.status(400).send({
                message: "Invalid Request"
            })
        }
        const chats = await ChatModel.aggregate([
            {
                $match: {
                    users: { $in: [new Types.ObjectId(id)] }
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "users",
                    foreignField: "_id",
                    as: "users_info"
                }
            }, {
                $sort: {
                    updatedAt: -1
                }
            }
        ])
        return response.status(200).send(chats)    
    } catch (err) {
        console.log(err);
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })   
    }
}

export default {
    chats, chatList
}