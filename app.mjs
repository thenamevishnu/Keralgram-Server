import express from "express"
import { Server } from "socket.io"
import cors from "cors"
import userRoute from "./routes/user.route.mjs"
import { db } from "./config/db.config.mjs"
import chatRoute from "./routes/chat.route.mjs"
import messageRoute from "./routes/message.route.mjs"
import { ActiveModel } from "./models/active.model.mjs"
import groupRoute from "./routes/group.route.mjs"
import { ChatModel } from "./models/chat.model.mjs"

await db.connect()
const app = express()

app.use(cors({
    origin: "*",
    methods: "*"
}))
app.use(express.json({ limit: "450mb" }))
app.use("/assets", express.static("assets"))
app.use("/files", express.static("files"))

app.get("/", (req, res) => {
    return res.status(200).send({ message: "Welcome to the server" })
})

app.use("/v1/users", userRoute)
app.use("/v1/chats", chatRoute)
app.use("/v1/messages", messageRoute)
app.use("/v1/groups", groupRoute)

const server = app.listen(process.env.PORT || 8081, () => {
    console.log(`Listening on port ${process.env.PORT || 8081}`)
})

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*",
        methods: "*"
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

    socket.on("send_message", async messageObj => {
        socket.to(messageObj.chat_id).emit("receive_message", messageObj)
        const users = await ChatModel.findOne({ _id: messageObj.chat_id })
        socket.to(users.users.map(i => i.toString())).emit("receive_message_alt", messageObj)
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

    socket.on("new_chat_added", ({ id, chat_id, user, chat_users, messageObj }) => {
        socket.to([id, chat_id, ...chat_users]).emit("new_chat_added", { user, chat_id, messageObj })
    })

    socket.on("left_from_chat", ({ chat_id, user_id, chat_users, messageObj }) => {
        socket.to([chat_id, ...chat_users]).emit("left_from_chat", { user_id, chat_id, messageObj })
    })
})
