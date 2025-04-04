import multer from "multer";
import { v4 as uuidv4 } from "uuid"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "assets")
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, `${file.originalname}`)
    }
})

export const upload = multer({ storage: storage })