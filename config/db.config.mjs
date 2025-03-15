import { connect } from "mongoose";

export const db = {
    connect: async () => {
        try {
            const { connection: { db: { databaseName } } } = await connect(process.env.MONGODB_URL, {
                dbName: "chat_app"
            });
            console.log(databaseName + " connected");
        } catch (err) {
            console.log(err);
            return process.exit(1)
        }
    }
}