import { model, Schema, Types } from "mongoose";

const schema = new Schema({
    user_id: { type: String, required: true }
}, {
    timestamps: true
})

export const ActiveModel = model("active_users", schema)