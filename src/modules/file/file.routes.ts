import { Router } from "express"
import { getFileInformation, postFile } from "./file.controller.js"
import { multerError, uploadFile } from "./file.middleware.js"
import { verifyUser } from "auth"

const router = Router()
router.post("/files", [verifyUser, uploadFile.single("file"), postFile])
router.get("/files/:fileId", [verifyUser, getFileInformation])

export default router



