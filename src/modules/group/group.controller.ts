import { Request, Response } from "express"
import * as GroupService from "./group.service.js"
import { ErrorResponse } from "../../shared/types.js"
import { CreateRoomSchema } from "./group.dto.js"

export async function postGroup(req: Request, res: Response) {
    const body = req.body
    let err_response: ErrorResponse
    const dto = CreateRoomSchema.safeParse(body)

    if(!dto.success) {
        err_response = {
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors}
        }
        return res.status(400).json(err_response)
    }

    const sv_res = await GroupService.createGroup(dto.data)
    if(sv_res.success) {
        res.status(201).json({id: sv_res.data?.id})
    }

    if(sv_res.code == "NAME_TOO_LONG"){
        err_response = {
            error : "INVALID_DATA",
            message : "Name is too long",
            detail : {name : ["Name is too long"]}
        }
        return res.status(400).json(err_response)
    } 
    if(sv_res.code == "INVALID_GROUP_TYPE") {
        err_response = {
            error : "INVALID_DATA",
            message : "Invalid group type",
            detail : {type : ["Type must be direct or group"]}
        }
        return res.status(400).json(err_response)
    }
    err_response = {
        error : "SERVER_ERROR",
        message : "Server error",
        detail : {server : ["Server error"]}
    }
    return res.status(500).json(err_response)
}