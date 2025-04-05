import express from "express"
import { Server } from "socket.io"
import cors from "cors"
import userRoute from "./routes/user.route.mjs"
import { db } from "./config/db.config.mjs"
import chatRoute from "./routes/chat.route.mjs"
import messageRoute from "./routes/message.route.mjs"
import { ActiveModel } from "./models/active.model.mjs"

await db.connect()
const app = express()

app.use(cors())
app.use(express.json())
app.use("/assets", express.static("assets"))

app.use("/v1/users", userRoute)
app.use("/v1/chats", chatRoute)
app.use("/v1/messages", messageRoute)

const server = app.listen(process.env.PORT || 8081, () => {
    console.log(`Listening on port ${process.env.PORT || 8081}`)
})

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "DELETE", "PATCH"]
    }
})

io.on("connection", (socket) => {

    socket.on("join_chat", ({ chat_id }) => {
        socket.join(chat_id)
    })

    socket.on("join", async id => {
        await socket.join(id)
        const res = await ActiveModel.findOne({ user_id: id })
        if (!res) {
            await ActiveModel.create({ user_id: id })
            socket.to((await ActiveModel.find()).map(i => i.user_id)).emit("active_status_update", {id, online: true})
        }
    })

    socket.on("offline", async id => {
        const res = await ActiveModel.findOne({ user_id: id })
        if (res) {
            await ActiveModel.deleteMany({ user_id: id })
            socket.to((await ActiveModel.find()).map(i => i.user_id)).emit("active_status_update", {id, online: false})
        }
    })

    socket.on("send_message", messageObj => {
        socket.to(messageObj.chat_id).emit("receive_message", messageObj)
        socket.to(messageObj.to).emit("receive_message_alt", messageObj)
    })

    socket.on("start_typing", ({ chat_id, user }) => {
        socket.to(chat_id).emit("on_start_typing", { user })
    })
    
    socket.on("message_deleted", message => {
        socket.to(message.chat_id).emit("on_delete_message", message)
    })

    socket.on("stop_typing", ({ chat_id, user }) => {
        socket.to(chat_id).emit("on_stop_typing", { user })
    }) 
})
