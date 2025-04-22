import cronTask from "node-cron"
import axios from "axios"

cronTask.schedule("* * * * *", async () => {
    try {
        const { status } = await axios.get(process.env.SERVER)
        if (status === 200) {
            console.log("Server is up and running")
        } else {
            console.log("Server is down")
        }
    } catch (err) {
        return response.status(500).send({
            message: err.message || "Internal Server Error"
        })
    }
})