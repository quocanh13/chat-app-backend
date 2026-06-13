import { Request, Response } from "express"
import * as GroupService from "./group.service.js"
import { ErrorResponse } from "../../shared/types.js"
import { CreateRoomSchema } from "./group.dto.js"

export async function postGroup(req: Request, res: Response) {
    const body = req.body
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
        res.status(201).json({id: serviceResult.data?.id})
    }

    if(serviceResult.code == "NAME_TOO_LONG"){
        errorResponse = {
            error : "INVALID_DATA",
            message : "Name is too long",
            detail : {name : ["Name is too long"]}
        }
        return res.status(400).json(errorResponse)
    } 
    if(serviceResult.code == "INVALID_GROUP_TYPE") {
        errorResponse = {
            error : "INVALID_DATA",
            message : "Invalid group type",
            detail : {type : ["Type must be direct or group"]}
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