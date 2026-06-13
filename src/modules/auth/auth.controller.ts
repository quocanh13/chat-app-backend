import {Request, Response} from "express"
import { LoginSchema, RegisterSchema } from "./auth.dto.js"
import { ErrorResponse } from "../../shared/types.js"
import * as authService from "./auth.service.js"

export async function register(req: Request, res: Response){
    const body = req.body
    let errorResponse: ErrorResponse
    const dto = RegisterSchema.safeParse(body)

    if(!dto.success){
        errorResponse = {
            error : "INVALID_DATA",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors}
        }
        return res.status(400).json(errorResponse)
    }

    const sv_res = await authService.register(dto.data)
    if(!sv_res.success){
        if(sv_res.code == "USERNAME_EXISTS") {
            errorResponse = {
                error: "USERNAME_EXISTS",
                detail: {
                    username: ["Username exists"]
                }
            }
            return res.status(400).json(errorResponse)
        } else {
            errorResponse = {
                error: "INTERNAL_ERROR",
                detail: {
                    server: ["Server error"]
                }
            }
            return res.status(500).json(errorResponse)
        }

    } else {
        return res.sendStatus(201)
    }
}

export async function login(req: Request, res: Response) {
    const body = req.body
    let errorResponse: ErrorResponse
    const dto = LoginSchema.safeParse(body)

    if(!dto.success){
        errorResponse = {
            error : "INVALID_DATA",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors},
            message : "Invalid data"
        }
        return res.status(400).json(errorResponse)
    }

    const sv_res = await authService.login(dto.data)
    if(!sv_res.success){
        if(sv_res.code == "USERNAME_NOT_EXISTS") {
            errorResponse = {
                error: "USERNAME_NOT_EXISTS",
                detail: {
                    username: ["Username does not exists"]
                },
                message : "Username does not exist"
            }
            return res.status(404).json(errorResponse)
        }
        else if(sv_res.code == "INVALID_PASSWORD"){
            errorResponse = {
                error: "INVALID_PASSWORD",
                detail: {
                    password: ["Invalid password"]
                },
                message : "Invalid password"
            }
            return res.status(401).json(errorResponse)
        } else {
            errorResponse = {
                error: "INTERNAL_ERROR",
                detail: {
                    server: ["Server error"]
                },
                message : "Server error"
            }
            return res.status(500).json(errorResponse)
        }

    } else {
        return res.status(200).json(sv_res.data)
    }  
}