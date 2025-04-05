import { Types } from "mongoose";
import { MessageModel } from "../models/message.model.mjs"
import { ChatModel } from "../models/chat.model.mjs";
import { v4 } from "uuid";
import { UserModel } from "../models/user.model.mjs";
import { UnreadModel } from "../models/unread.model.mjs";
import { ActiveModel } from "../models/active.model.mjs";

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
        const { message, time, chat_id, sender, file_size, file_extension, file_name, to, type } = request.body
        if(!message || !time || !chat_id || !sender || !to) {
            return response.status(400).send({
                message: "Invalid Request"
            })
        }
        let messageText = message;
        if (type == "text") {
            messageText = message.replace(/(https?:\/\/[^\s]+)/g, '<a style="color: #29B6F6;" href="$1">$1</a>');
        }
        const res = await MessageModel.create({
            message: messageText,
            time,
            chat_id,
            sender,
            file_size,
            file_name,
            file_extension,
            to,
            type,
            message_id: v4()
        })
        const user = await UserModel.findOne({ _id: sender })
        await ChatModel.updateOne({ _id: chat_id }, { last_message_type: type, last_message: message, last_message_time: Math.floor(new Date().getTime() / 1000) })
        const is_active = await ActiveModel.findOne({ user_id: to })
        if (!is_active) {
            await UnreadModel.updateOne({ chat_id }, { $inc: { [sender]: 1 } })
        }
        return response.status(200).send({ ...res._doc, name: user?.name })
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

const uploadFile = async (request, response) => {
    try {
        const res = request.files
        const mimetype = res?.[0]?.mimetype?.split("/")?.[0]
        const fileExtension = res?.[0]?.mimetype?.split("/")?.[1]
        return response.status(200).send({ file_name: res[0].originalname, url: process.env.SERVER + "/assets/" + res[0].originalname, type: mimetype, ext: fileExtension })
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal server error"
        })
    }
}

const incrementUnread = async (request, response) => {
    try {
        const { chat_id, to, reset } = request.body
        let res = await UnreadModel.findOne({ chat_id })
        if (reset) {
            if (res) {
                res[to] = 0
                await UnreadModel.updateOne({ chat_id }, { $set: { [to]: 0 } })
                return response.status(200).send(res)
            }
            return response.status(200).send(res)
        }
        if(!res){
            res = await UnreadModel.create({ chat_id, [to]: 1 })
        } else {
            res[to] = res[to] + 1
            await UnreadModel.updateOne({ chat_id }, { $inc: { [to]: 1 } })
        }
        return response.status(200).send(res)
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })   
    }
}

export default { messages, sendMessage, deleteMessage, uploadFile, incrementUnread }