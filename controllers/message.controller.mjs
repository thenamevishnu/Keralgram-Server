import { Types } from "mongoose";
import { MessageModel } from "../models/message.model.mjs"
import { ChatModel } from "../models/chat.model.mjs";
import { v4 } from "uuid";
import { UserModel } from "../models/user.model.mjs";

const messages = async (request, response) => {
    try {
        const { chat_id } = request.params
        const messages = await MessageModel.aggregate([
            {
                $match: { chat_id: new Types.ObjectId(chat_id) }
            }
        ])
        return response.status(200).send(messages)
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })   
    }
}

const sendMessage = async (request, response) => {
    try {
        const { message, time, chat_id, sender, to } = request.body
        if(!message || !time || !chat_id || !sender || !to) {
            return response.status(400).send({
                message: "Invalid Request"
            })
        }
        const res = await MessageModel.create({
            message,
            time,
            chat_id,
            sender,
            to,
            message_id: v4()
        })
        const user = await UserModel.findOne({ _id: sender })
        await ChatModel.updateOne({ _id: chat_id }, { last_message: message, last_message_time: Math.floor(new Date().getTime() / 1000) })
        return response.status(200).send({...res._doc, name: user?.name})
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })   
    }
}

const deleteMessage = async (request, response) => {
    try {
        const { id } = request.params
        const { type } = request.query
        if(!id) {
            return response.status(400).send({
                message: "Invalid Request"
            })
        }
        const updateQuery = type === "everyone" 
            ? { $set: { delete_for_everyone: true } } 
            : { $addToSet: { delete_for_me: type } };
        const res = await MessageModel.updateOne({ _id: new Types.ObjectId(id) }, updateQuery);
        if (res.matchedCount == 1 && res.modifiedCount == 1) {
            return response.status(200).send({
                message: "Message Deleted",
                updated: await MessageModel.findOne({ _id: id }),
                type
            })
        }
        return response.status(500).send({
            message: "Something error happend"
        })
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })
    }
}

export default { messages, sendMessage, deleteMessage }