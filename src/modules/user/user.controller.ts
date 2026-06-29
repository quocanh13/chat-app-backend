import {Request, Response} from "express"
import { GetGroupListSchema, GetUserByIdSchema, PatchUserSchema, PutUserSchema } from "./user.dto.js"
import { ErrorResponse } from "../../shared/types.js"
import * as UserService from "./user.service.js"
import { GroupService } from "group"

export async function getUserById(req: Request, res: Response) {
    const dto = GetUserByIdSchema.safeParse(req.params)
    let errorResponse: ErrorResponse

    if(!dto.success){

        errorResponse = {
            error : "INVALID_DATA",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors},
            message : "Invalid data"
        }
        return res.status(400).json(errorResponse)

    }

    const serviceResult = await UserService.getUserById({
        id : dto.data.id, 
        fields : ["id", "username", "name", "avatarFileId"]}
    )

    if(!serviceResult.success){
        if(serviceResult.code == "USER_NOT_FOUND") {

            errorResponse = {
                error: "NOT_FOUND",
                message : `User with ${dto.data.id} not found`
            }
            return res.status(404).json(errorResponse)

        } else {
            errorResponse = {
                error: "INTERNAL_ERROR",
                message : "Server error"
            }
            return res.status(500).json(errorResponse)
        }

    } else {
        return res.status(200).json(serviceResult.data)
    }
}

export async function putUser(req: Request, res: Response) {
    let errorResponse: ErrorResponse
    const id = Number(req.params.id)
    const data = {...req.body, id}
    const dto = PutUserSchema.safeParse(data)
    if(id != req.user!.id) {
        errorResponse = {
            error : "ACCESS_DENIED",
            message : `User ID in the URL (${id}) does not match the authenticated user ID (${req.user!.id})`
        }
        return res.status(401).json(errorResponse)
    }
    if(!dto.success){
        errorResponse = {
            error : "INVALID_DATA",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors},
            message : "Invalid data"
        }
        return res.status(400).json(errorResponse)
    }

    const serviceResult = await UserService.updateUser(dto.data)
    if(serviceResult.success) {
        return res.sendStatus(204)
    }
    
    if(serviceResult.code == "USER_NOT_FOUND"){
        errorResponse = {
            error : "USER_NOT_FOUND",
            detail : {id : ["Not found"]},
            message : `User with id = ${id} not found`
        }
        return res.status(404).json(errorResponse)
    } else if(serviceResult.code == "AVATAR_ACCESS_DENIED") {
        errorResponse = {
            error : "AVATAR_ACCESS_DENIED",
            detail : {avatarFileId : [`You do not have the permisson to access the file with id = ${dto.data.avatarFileId}`]},
            message : `You do not have the permisson to access the file with id = ${dto.data.avatarFileId}`
        }
        return res.status(404).json(errorResponse)
    } else {
        errorResponse = {
            error : "SERVER_ERROR",
            detail : {server : ["Server error"]},
            message : `Server error`
        }
        return res.status(500).json(errorResponse)
    }
}

export async function patchUser(req: Request, res: Response) {
    let errorResponse: ErrorResponse
    const id = Number(req.params.id)
    const data = {...req.body, id}
    const dto = PatchUserSchema.safeParse(data)
    if(id != req.user!.id) {
        errorResponse = {
            error : "ACCESS_DENIED",
            message : `User ID in the URL (${id}) does not match the authenticated user ID (${req.user!.id})`
        }
        return res.status(401).json(errorResponse)
    }
    if(!dto.success){
        errorResponse = {
            error : "INVALID_DATA",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors},
            message : "Invalid data"
        }
        return res.status(400).json(errorResponse)
    }

    const serviceResult = await UserService.updateUser(dto.data)
    if(serviceResult.success) {
        return res.sendStatus(204)
    }

    if(serviceResult.code == "USER_NOT_FOUND"){
        errorResponse = {
            error : "USER_NOT_FOUND",
            message : `User with id = ${id} not found`
        }
        return res.status(404).json(errorResponse)
    } else {
        errorResponse = {
            error : "SERVER_ERROR",
            message : `Server error`
        }
        return res.status(500).json(errorResponse)
    }
}

export async function getGroupList(req: Request, res: Response) {
    const input = {
        authUserId : req.user?.id,
        userId : Number(req.params.id)
    }
    const dto = GetGroupListSchema.safeParse(input)
    let errorResponse: ErrorResponse

    if(!dto.success){

        errorResponse = {
            error : "INVALID_DATA",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors},
            message : "Invalid data"
        }
        return res.status(400).json(errorResponse)

    }

    const getGroupListResult = await GroupService.getGroupList(dto.data)
    if(getGroupListResult.success)
        return res.status(200).json(getGroupListResult.data)

    if(getGroupListResult.code == "GROUP_LIST_ACCESS_DENIED"){
        errorResponse = {
            error : "GROUP_LIST_ACCESS_DENIED",
            message : `User with id = ${input.authUserId} does not have permisson to access group list of user with id = ${input.userId}`
        }
        return res.status(403).json(errorResponse)
    }

    errorResponse = {
        error : "SERVER_ERROR",
        message : `Server error`
    }
    return res.status(500).json(errorResponse)
}