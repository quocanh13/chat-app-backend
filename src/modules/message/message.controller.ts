import { Request, Response } from "express"
import { ErrorResponse } from "../../shared/types.js"
import * as MessageService from "./message.service.js"
import { SendMessageSchema } from "./message.dto.js"

export async function postMessage(req: Request, res: Response) {
    let errorResponse : ErrorResponse
    const input = {
        ...req.body,
        groupId : Number(req.params.groupId),
        userId : req.user?.id
    }
    const dto = SendMessageSchema.safeParse(input)
    
    if(!dto.success){
        errorResponse = {
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {
                ...dto.error.flatten().fieldErrors,
                ...dto.error.flatten().formErrors
            }
        }
        return res.status(400).json(errorResponse) 
    }

    const sendMessageResult = await MessageService.sendMessage(dto.data)
    if(sendMessageResult.success)
        return res.status(200).json(sendMessageResult.data)

    if(sendMessageResult.code == "USER_NOT_MEMBER"){
        errorResponse = {
            error : "USER_NOT_MEMBER",
            message : `You are not a member of the group with id = ${dto.data.groupId}`
        }
        return res.status(403).json(errorResponse) 
    }

    if(sendMessageResult.code == "FILE_ACCESS_DENIED"){
        errorResponse = {
            error : "FILE_ACCESS_DENIED",
            message : `User with id = ${dto.data.userId} does not have permission to access file with id = ${dto.data.fileId}`
        }
        return res.status(403).json(errorResponse) 
    }

    if(sendMessageResult.code == "FILE_NOT_FOUND"){
        errorResponse = {
            error : "FILE_NOT_FOUND",
            message : `File with id = ${dto.data.fileId} not found`
        }
        return res.status(404).json(errorResponse) 
    }

    errorResponse = {
        error : "SERVER_ERROR",
        message : "Server Error"
    }
    return res.status(500).json(errorResponse) 
}