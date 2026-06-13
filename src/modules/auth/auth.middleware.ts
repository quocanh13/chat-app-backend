import { NextFunction, Request, Response } from "express"
import * as AuthService from "./auth.service.js"
import { ErrorResponse } from "../../shared/types.js"

export function verifyUser(req: Request, res: Response, next : NextFunction){
    let token = req.headers.authorization
    token = token?.split(" ")[1]
    let err_response : ErrorResponse
    if(token == undefined){
        err_response = {
            error : "TOKEN_NOT_FOUND",
            detail : {token : "Token not found"},
            message : "TOken not found"
        }
        return res.status(400).json(err_response)
    }
    
    const sv_res = AuthService.verifyUser(token)
    if(!sv_res.success){
        if(sv_res.code == "TOKEN_EXPIRED") {
            err_response = {
                error: "TOKEN_EXPIRED",
                detail : {
                    token : ["Token expired"]
                },
                message : "Token expired"
            }
            return res.status(400).json(err_response)
        } else {
            err_response = {
                error: "INVALID_TOKEN",
                detail : {
                    token : ["Invalid token"]
                },
                message : "Invalid token"
            }
        }
        return res.status(400).json(err_response)
    } else {
        req.user = sv_res.data
        next()
    }
}