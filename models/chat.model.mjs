import { model, Schema, Types } from "mongoose";

const schema = new Schema({
    users: [{
        type: Types.ObjectId
    }],
    owner: { type: Types.ObjectId },
    admins: [{ type: Types.ObjectId }],
    title: { type: String },
    picture: { type: String, default: process.env.SERVER + "/files/group-pic.png" },
    chat_type: { type: String, default: "private" },
    last_message_type: { type: String },
    message_id: { type: String },
    last_message: { type: String },
    last_message_time: { type: Number }
}, {
    timestamps: true
})

export const ChatModel = model("chats", schema)