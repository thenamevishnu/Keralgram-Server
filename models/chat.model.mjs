import { model, Schema, Types } from "mongoose";

const schema = new Schema({
    users: [{
        type: Types.ObjectId
    }],
    last_message: { type: String },
    last_message_time: { type: Number }
}, {
    timestamps: true
})

export const ChatModel = model("chats", schema)