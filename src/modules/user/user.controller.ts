import {NextFunction, Request, Response} from "express"
import { GetUserByIdSchema, PatchUserSchema, PutUserSchema } from "./user.dto.js"
import { ErrorResponse } from "../../shared/types.js"
import * as UserService from "./user.service.js"
import { updateUser } from "./user.repository.js"

export async function getUserById(req: Request, res: Response) {
    const dto = GetUserByIdSchema.safeParse(req.params)
    let err_response: ErrorResponse

    if(!dto.success){

        err_response = {
            error : "INVALID_DATA",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors},
            message : "Invalid data"
        }
        return res.status(400).json(err_response)

    }

    const sv_res = await UserService.getUserById(dto.data.id)

    if(!sv_res.success){
        if(sv_res.code == "USER_NOT_FOUND") {

            err_response = {
                error: "NOT_FOUND",
                detail: {
                    id: ["Not found"]
                },
                message : `User with ${dto.data.id} not found`
            }
            return res.status(404).json(err_response)

        } else {
            err_response = {
                error: "INTERNAL_ERROR",
                detail: {server : ["Server error"]},
                message : "Server error"
            }
            return res.status(500).json(err_response)
        }

    } else {
        return res.status(200).json(sv_res.data)
    }
}

export async function putUser(req: Request, res: Response) {
    let err_response: ErrorResponse
    const id = Number(req.params.id)
    const data = {...req.body, id}
    const dto = PutUserSchema.safeParse(data)
    if(id != req.user!.id) {
        err_response = {
            error : "ACCESS_DENIED",
            detail : {
                id : [`User ID in the URL (${id}) does not match the authenticated user ID (${req.user!.id})`]
            },
            message : "You do not have permission to update this resource."
        }
        return res.status(401).json(err_response)
    }
    if(!dto.success){
        err_response = {
            error : "INVALID_DATA",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors},
            message : "Invalid data"
        }
        return res.status(400).json(err_response)
    }

    const sv_res = await UserService.updateUser(dto.data)
    if(sv_res.success) {
        return res.sendStatus(204)
    }
    
    if(sv_res.code == "USER_NOT_FOUND"){
        err_response = {
            error : "USER_NOT_FOUND",
            detail : {id : ["Not found"]},
            message : `User with id = ${id} not found`
        }
        return res.status(404).json(err_response)
    } else if(sv_res.code == "AVATAR_ACCESS_DENIED") {
        err_response = {
            error : "AVATAR_ACCESS_DENIED",
            detail : {avatarFileId : [`You do not have the permisson to access the file with id = ${dto.data.avatarFileId}`]},
            message : `You do not have the permisson to access the file with id = ${dto.data.avatarFileId}`
        }
        return res.status(404).json(err_response)
    } else {
        err_response = {
            error : "SERVER_ERROR",
            detail : {server : ["Server error"]},
            message : `Server error`
        }
        return res.status(500).json(err_response)
    }
}

export async function patchUser(req: Request, res: Response) {
    let err_response: ErrorResponse
    const id = Number(req.params.id)
    const data = {...req.body, id}
    const dto = PatchUserSchema.safeParse(data)
    if(id != req.user!.id) {
        err_response = {
            error : "ACCESS_DENIED",
            detail : {
                id : [`User ID in the URL (${id}) does not match the authenticated user ID (${req.user!.id})`]
            },
            message : "You do not have permission to update this resource."
        }
        return res.status(401).json(err_response)
    }
    if(!dto.success){
        err_response = {
            error : "INVALID_DATA",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors},
            message : "Invalid data"
        }
        return res.status(400).json(err_response)
    }

    const sv_res = await updateUser(dto.data)
    if(sv_res.success) {
        return res.sendStatus(204)
    }

    if(sv_res.code == "USER_NOT_FOUND"){
        err_response = {
            error : "USER_NOT_FOUND",
            detail : {id : ["Not found"]},
            message : `User with id = ${id} not found`
        }
        return res.status(404).json(err_response)
    } else {
        err_response = {
            error : "SERVER_ERROR",
            detail : {server : ["Server error"]},
            message : `Server error`
        }
        return res.status(404).json(err_response)
    }
}