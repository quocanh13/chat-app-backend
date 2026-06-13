import { Request, Response } from "express"
import * as GroupService from "./group.service.js"
import { ErrorResponse } from "../../shared/types.js"
import { CreateRoomSchema } from "./group.dto.js"

export async function postGroup(req: Request, res: Response) {
    const body = {...req.body, hostId : req.user?.id}
    let errorResponse: ErrorResponse
    const dto = CreateRoomSchema.safeParse(body)

    if(!dto.success) {
        errorResponse = {
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors}
        }
        return res.status(400).json(errorResponse)
    }

    const serviceResult = await GroupService.createGroup(dto.data)
    if(serviceResult.success) {
        return res.status(201).json({id: serviceResult.data?.id})
    }

    if(serviceResult.code == "GROUP_NAME_TOO_LONG"){
        errorResponse = {
            error : "GROUP_NAME_TOO_LONG",
            message : "Group name is too long",
            detail : {name : ["Group name is too long"]}
        }
        return res.status(400).json(errorResponse)
    } 
    errorResponse = {
        error : "SERVER_ERROR",
        message : "Server error",
        detail : {server : ["Server error"]}
    }
    return res.status(500).json(errorResponse)
}