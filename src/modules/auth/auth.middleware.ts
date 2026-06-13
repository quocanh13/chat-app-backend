import { NextFunction, Request, Response } from "express"
import * as AuthService from "./auth.service.js"
import { ErrorResponse } from "../../shared/types.js"

export function verifyUser(req: Request, res: Response, next : NextFunction){
    let token = req.headers.authorization
    token = token?.split(" ")[1]
    let errorResponse : ErrorResponse
    if(token == undefined){
        errorResponse = {
            error : "TOKEN_NOT_FOUND",
            detail : {token : "Token not found"},
            message : "TOken not found"
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