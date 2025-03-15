import { Types } from "mongoose";
import { MessageModel } from "../models/message.model.mjs"
import { ChatModel } from "../models/chat.model.mjs";
import { v4 } from "uuid";

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
        await ChatModel.updateOne({ _id: chat_id }, { last_message: message, last_message_time: Math.floor(new Date().getTime() / 1000) })
        return response.status(200).send(res)
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })   
    }
}

export default { messages, sendMessage }