import jwt from "jsonwebtoken"

export const AuthUser = (request, response, next) => {
    try {
        const tokenString = request.headers.authorization
        if (!tokenString) {
            return response.status(401).send({ message: "Unauthorized" })
        }
        const [_, access_token] = tokenString.split(" ")
        if(!access_token) {
            return response.status(401).send({ message: "Unauthorized" })
        }
        try {
            const decoded = jwt.verify(access_token, process.env.JWT_SECRET)
            if(!decoded) {
                return response.status(401).send({ message: "Unauthorized" })
            }
            next()
        } catch (err) {
            return response.status(401).send({ message: "Unauthorized" })
        }
    } catch (err) {
        return response.status(500).send({ message: err.message || "Internal Server Error" })
    }
}