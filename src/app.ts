import express from "express"
import { userRouter } from "./modules/user/index.js"

const app = express()

app.use(express.json())

app.use("/", (req, res, next)=>{
    console.log(req.method, req.url)
    next()
})

app.use(userRouter)

export default app

