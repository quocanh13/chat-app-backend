import express from "express"
import { userRouter } from "./modules/user/index.js"
import { authRouter } from "./modules/auth/index.js"
import { groupRouter } from "./modules/group/index.js"

const app = express()

app.use(express.json())

app.use("/", (req, res, next)=>{
    console.log(req.method, req.url)
    next()
})

app.use(authRouter)
app.use(userRouter)
app.use(groupRouter)

export default app

