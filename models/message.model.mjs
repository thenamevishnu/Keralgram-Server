import { model, Schema, Types } from "mongoose";

const schema = new Schema({
    message: { type: String, required: true },
    time: { type: String, required: true },
    chat_id: { type: Types.ObjectId, required: true },
    sender: { type: Types.ObjectId, required: true },
    to: { type: Types.ObjectId, required: true },
    message_id: { type: String, required: true },
    delete_for_me: [{ type: String }],
    delete_for_everyone: { type: Boolean, default: false }
}, {
    timestamps: true
})

export const MessageModel = model("messages", schema)
