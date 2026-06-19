import http from "http"
import app from "./app.js";
import {initSocketServer} from "./socket.js";

const httpServer = http.createServer(app)
initSocketServer(httpServer)

const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || "0.0.0.0"

httpServer.listen(PORT, HOST, ()=>{
    console.log(`Server is listening in port ${PORT}`)
})

