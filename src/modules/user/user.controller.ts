import {Request, Response} from "express"
import { RegisterSchema } from "./user.dto.js"
import { ErrorResponse } from "../../shared/types.js"
import { register } from "./user.service.js"

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

    const sv_res = await register(dto.data)
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