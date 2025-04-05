import { model, Schema, Types } from "mongoose";

const schema = new Schema({
    chat_id: {
        type: Types.ObjectId,
        required: true
    }
}, {
    timestamps: true,
    strictQuery: false,
    strict: false
})

export const UnreadModel = model("unreadings", schema)
