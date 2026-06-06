import express from "express"
import { userRouter } from "./modules/user/index.js"
import { authRouter } from "./modules/auth/index.js"

const app = express()

app.use(express.json())

app.use("/", (req, res, next)=>{
    console.log(req.method, req.url)
    next()
})

app.use(userRouter)
app.use(authRouter)

export default app

