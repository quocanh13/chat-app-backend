import { Request, Response } from "express"
import * as GroupService from "./group.service.js"
import { ErrorResponse } from "../../shared/types.js"
import { AddUserToGroupSchema, CreateGroupSchema, GetGroupSchema } from "./group.dto.js"

export async function postGroup(req: Request, res: Response) {
    const body = {...req.body, hostId : req.user?.id}
    let errorResponse: ErrorResponse
    const dto = CreateGroupSchema.safeParse(body)

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
export async function getGroup(req: Request, res: Response) {
    const input = {
        groupId : Number(req.params.groupId), 
        userId : req.user?.id, 
        includeMember : req.query.includeMember === "1" ? true : false
    }

    let errorResponse: ErrorResponse
    const dto = GetGroupSchema.safeParse(input)

    if(!dto.success) {
        errorResponse = {
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors}
        }
        return res.status(400).json(errorResponse)
    }

    const serviceResult = await GroupService.getGroup(dto.data)
    if(serviceResult.success) {
        return res.status(200).json(serviceResult.data)
    }

    if(serviceResult.code == "ONLY_MEMBER_CAN_ACCESS"){
        errorResponse = {
            error : "ONLY_MEMBER_CAN_ACCESS",
            message : "Only member can access group information",
            detail : {permission : ["Only member can access group information"]}
        }
        return res.status(400).json(errorResponse)
    } 
    if(serviceResult.code == "GROUP_NOT_EXISTS"){
        errorResponse = {
            error : "GROUP_NOT_EXISTS",
            message : "Group does not exist",
            detail : {groupId : [`Group with id = ${dto.data.groupId} does not exist`]}
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
export async function postMember(req: Request, res: Response) {
    const input = {userId : req.body.userId, hostId : req.user!.id, groupId : Number(req.params.groupId)}
    let errorResponse: ErrorResponse
    const dto = AddUserToGroupSchema.safeParse(input)

    if(!dto.success) {
        errorResponse = {
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors}
        }
        return res.status(400).json(errorResponse)
    }

    const serviceResult = await GroupService.addUserToGroup(dto.data)
    if(serviceResult.success) {
        return res.sendStatus(204)
    }
    if(serviceResult.code == "ONLY_HOST_CAN_ADD_MEMBER"){
        errorResponse = {
            error : "ONLY_HOST_CAN_ADD_MEMBER",
            message : "Only host can add member",
            detail : {permission : ["Only host can add member"]}
        }
        return res.status(403).json(errorResponse)
    }
    if(serviceResult.code == "USER_ALREADY_IN_GROUP"){
        errorResponse = {
            error : "USER_ALREADY_IN_GROUP",
            message : "User is already in group",
            detail : {userId : ["User is already in group"]}
        }
        return res.status(409).json(errorResponse)
    } 
    if(serviceResult.code == "USER_OR_GROUP_NOT_EXIST"){
        errorResponse = {
            error : "USER_OR_GROUP_NOT_EXIST",
            message : "User or group does not exist",
            detail : {
                userId : ["User might not exist"], 
                groupId : ["Group might not exist"]
            }
        }
        return res.status(404).json(errorResponse)
    } 
    console.log(serviceResult)
    errorResponse = {
        error : "SERVER_ERROR",
        message : "Server error",
        detail : {server : ["Server error"]}
    }
    return res.status(500).json(errorResponse)
}