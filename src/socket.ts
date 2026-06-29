import { Server, Socket } from 'socket.io';
import http from "http"
import { verifyUserSocket } from './modules/auth/auth.middleware.js';

let io : Server | undefined = undefined

export function initSocketServer(httpServer : http.Server){
    io = new Server(httpServer, {
        cors : {
            origin : "*"
        }
    })

    io.use(verifyUserSocket)

    io.on("connection", (socket)=>{
        console.log("Client connected: ", socket.id)

        socket.on("disconnect", ()=>{
            console.log("Disconnected:", socket.id);
        })
    })
}

export function getIO() : Server{
    if(io)
        return io
    throw new Error("IO is undefined")
}

