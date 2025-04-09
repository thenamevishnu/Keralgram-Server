import { model, Schema, Types } from "mongoose";

const schema = new Schema({
    message: { type: String, required: true },
    time: { type: String, required: true },
    file_name: { type: String },
    file_extension: { type: String },
    chat_type: { type: String, required: true },
    file_size: { type: Number },
    chat_id: { type: Types.ObjectId, required: true },
    sender: { type: Types.ObjectId, required: true },
    type: { type: String, required: true, default: "text" },
    to: { type: Types.ObjectId, required: false },
    message_id: { type: String, required: true },
    delete_for_me: [{ type: String }],
    delete_for_everyone: { type: Boolean, default: false }
}, {
    timestamps: true
})

export const MessageModel = model("messages", schema)
