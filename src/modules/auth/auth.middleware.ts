import { NextFunction, Request, Response } from "express"
import * as AuthService from "./auth.service.js"
import { ErrorResponse, SocketAuthError } from "../../shared/types.js"
import { DefaultEventsMap, Socket } from "socket.io"
import { verify } from "../../utils/jwt.js"

export function verifyUser(req: Request, res: Response, next : NextFunction){
    let token = req.headers.authorization
    token = token?.split(" ")[1]
    let errorResponse : ErrorResponse
    if(token == undefined){
        errorResponse = {
            error : "TOKEN_NOT_FOUND",
            detail : {token : "Token not found"},
            message : "Token not found"
        }
        return res.status(400).json(errorResponse)
    }
    
    const serviceResult = AuthService.verifyUser(token)
    if(!serviceResult.success){
        if(serviceResult.code == "TOKEN_EXPIRED") {
            errorResponse = {
                error: "TOKEN_EXPIRED",
                detail : {
                    token : ["Token expired"]
                },
                message : "Token expired"
            }
            return res.status(400).json(errorResponse)
        } else {
            errorResponse = {
                error: "INVALID_TOKEN",
                detail : {
                    token : ["Invalid token"]
                },
                message : "Invalid token"
            }
        }
        return res.status(400).json(errorResponse)
    } else {
        req.user = serviceResult.data
        next()
    }
}

export function verifyUserSocket(socket : Socket, next : (err? : Error) => void){
    const token = socket.handshake.headers.token ? socket.handshake.headers.token : socket.handshake.auth.token

    if(token == undefined) {
        return next(new SocketAuthError("TOKEN_NOT_FOUND", "Token is not found"))
    }

    const res = verify(token)
    if(res == "INVALID_TOKEN")
        return next(new SocketAuthError("INVALID_TOKEN", "Invalid token"))
    else if(res == "TOKEN_EXPIRED")
        return next(new SocketAuthError("TOKEN_EXPIRED", "Token is expired"))
    
    socket.user = res
    next()
}