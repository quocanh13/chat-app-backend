import express, { NextFunction, Request, Response } from "express"
import { userRouter } from "./modules/user/index.js"
import { authRouter } from "./modules/auth/index.js"
import { groupRouter } from "./modules/group/index.js"
import { fileRouter } from "file"
import multer from "multer"
import { multerError } from "./modules/file/file.middleware.js"

const app = express()

app.use("/", (req, res, next)=>{
    console.log(req.method, req.url)
    next()
})

app.use(express.json())
app.use(authRouter)
app.use(userRouter)
app.use(groupRouter)
app.use(groupRouter)
app.use(fileRouter)

app.use((err: unknown, req : Request, res : Response, next: NextFunction) => {
    if(err instanceof multer.MulterError)
        return multerError(err, req, res, next)
    
    console.log(err)
    return res.sendStatus(500)
})

export default app

