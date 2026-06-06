import {Request, Response} from "express"
import { GetUserByIdSchema, RegisterSchema } from "./user.dto.js"
import { ErrorResponse } from "../../shared/types.js"
import * as userService from "./user.service.js"
import z, { number } from "zod"

export async function create(req: Request, res: Response){
    const body = req.body
    let err_response: ErrorResponse
    const dto = RegisterSchema.safeParse(body)

    if(!dto.success){
        err_response = {
            error : "INVALID_DATA",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors}
        }
        return res.status(400).json(err_response)
    }

    const sv_res = await userService.register(dto.data)
    if(!sv_res.success){
        if(sv_res.code == "USERNAME_EXISTS") {
            err_response = {
                error: "USERNAME_EXISTS",
                detail: {
                    username: ["Username exists"]
                }
            }
            return res.status(400).json(err_response)
        } else {
            err_response = {
                error: "INTERNAL_ERROR",
                detail: {
                    server: ["Server error"]
                }
            }
            return res.status(500).json(err_response)
        }

    } else {
        return res.sendStatus(201)
    }
}

export async function getUserById(req: Request, res: Response) {
    const dto = GetUserByIdSchema.safeParse(req.params)
    let err_response: ErrorResponse

    if(!dto.success){

        err_response = {
            error : "INVALID_DATA",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors}
        }
        return res.status(400).json(err_response)

    }

    const sv_res = await userService.getUserById(dto.data.id)

    if(!sv_res.success){
        if(sv_res.code == "USER_NOT_FOUND") {

            err_response = {
                error: "NOT_FOUND",
                detail: {
                    id: ["not found"]
                }
            }
            return res.status(404).json(err_response)

        } else {
            err_response = {
                error: "INTERNAL_ERROR",
                detail: {
                    server: ["Server error"]
                }
            }
            return res.status(500).json(err_response)
        }

    } else {
        return res.status(200).json(sv_res.data)
    }
}