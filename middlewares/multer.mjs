import multer from "multer";
import { v4 as uuidv4 } from "uuid"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "assets")
    },
    filename: function (req, file, cb) {
        const fileName = uuidv4()
        cb(null, `${fileName}.${file.mimetype.split("/")[1]}`)
    }
})

export const upload = multer({ storage: storage })