import { Request, Response } from "express"
import * as GroupService from "./group.service.js"
import { ErrorResponse } from "../../shared/types.js"
import { AddMemberSchema, CreateGroupSchema, DeleteMemberSchema, GetGroupSchema, GetMemberListSchema, PatchGroupSchema, PutGroupSchema } from "./group.dto.js"

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
    if(serviceResult.code == "GROUP_NOT_FOUND"){
        errorResponse = {
            error : "GROUP_NOT_FOUND",
            message : "Group not found",
            detail : {groupId : [`Group with id = ${dto.data.groupId} does not found`]}
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
export async function putGroup(req: Request, res: Response) {
    let errorResponse : ErrorResponse
    const input = {
        groupId : Number(req.params.groupId),
        userId : req.user?.id,
        name : req.body.name,
        avatarFileId : req.body.avatarFileId
    }

    const dto = PutGroupSchema.safeParse(input)
    if(!dto.success) {
        errorResponse = {
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {...dto.error.flatten().fieldErrors}
        }
        return res.status(400).json(errorResponse)
    }

    const serviceResult = await GroupService.updateGroup(dto.data)
    if(serviceResult.success)
        return res.sendStatus(204)

    if(serviceResult.code == "ONLY_HOST_CAN_UPDATE"){
        errorResponse = {
            error : "ONLY_HOST_CAN_UPDATE",
            message : "Only host can update"
        }
        return res.status(403).json(errorResponse)
    }

    if(serviceResult.code == "EMPTY_FIELD"){
        errorResponse = {
            error : "EMPTY_BODY",
            message : "Body is empty"
        }
        return res.status(400).json(errorResponse)
    }
    if(serviceResult.code == "GROUP_NOT_FOUND"){
        errorResponse = {
            error : "GROUP_NOT_FOUND",
            message : `Group with id = ${dto.data.groupId} not found`
        }
        return res.status(400).json(errorResponse)
    }
    errorResponse = {
        error : "SERVER_ERROR",
        message : "Server error"
    }
    return res.status(500).json(errorResponse)
}
export async function patchGroup(req: Request, res: Response) {
    let errorResponse : ErrorResponse
    const input = {
        groupId : Number(req.params.groupId),
        userId : req.user?.id,
        name : req.body.name,
        avatarFileId : req.body.avatarFileId
    }

    const dto = PatchGroupSchema.safeParse(input)
    if(!dto.success) {
        errorResponse = {
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {...dto.error.flatten().fieldErrors}
        }
        return res.status(400).json(errorResponse)
    }

    const serviceResult = await GroupService.updateGroup(dto.data)
    if(serviceResult.success)
        return res.sendStatus(204)

    if(serviceResult.code == "ONLY_HOST_CAN_UPDATE"){
        errorResponse = {
            error : "ONLY_HOST_CAN_UPDATE",
            message : "Only host can update"
        }
        return res.status(403).json(errorResponse)
    }

    if(serviceResult.code == "EMPTY_FIELD"){
        errorResponse = {
            error : "EMPTY_BODY",
            message : "Body is empty"
        }
        return res.status(400).json(errorResponse)
    }
    if(serviceResult.code == "GROUP_NOT_FOUND"){
        errorResponse = {
            error : "GROUP_NOT_FOUND",
            message : `Group with id = ${dto.data.groupId} not found`
        }
        return res.status(400).json(errorResponse)
    }
    if(serviceResult.code == "AVATAR_NOT_FOUND"){
        errorResponse = {
            error : "AVATAR_NOT_FOUND",
            message : `Avatar with file id = ${dto.data.avatarFileId} not found`
        }
        return res.status(404).json(errorResponse)
    }
    if(serviceResult.code == "AVATAR_ACCESS_DENIED"){
        errorResponse = {
            error : "AVATAR_ACCESS_DENIED",
            message : `You do not have the permisson to access avatar with file id = ${dto.data.avatarFileId}`
        }
        return res.status(404).json(errorResponse)
    }
    errorResponse = {
        error : "SERVER_ERROR",
        message : "Server error"
    }
    return res.status(500).json(errorResponse)
}
export async function postMember(req: Request, res: Response) {
    const input = {userId : req.body.userId, hostId : req.user!.id, groupId : Number(req.params.groupId)}
    let errorResponse: ErrorResponse
    const dto = AddMemberSchema.safeParse(input)

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
            message : `Only host can add member, your id = ${dto.data.hostId} is not the host`,
        }
        return res.status(403).json(errorResponse)
    }
    if(serviceResult.code == "USER_ALREADY_IN_GROUP"){
        errorResponse = {
            error : "USER_ALREADY_IN_GROUP",
            message : `User with id = ${dto.data.userId} is already in group`
        }
        return res.status(409).json(errorResponse)
    } 
    if(serviceResult.code == "USER_OR_GROUP_NOT_FOUND"){
        errorResponse = {
            error : "USER_OR_GROUP_NOT_FOUND",
            message : `User with id = ${dto.data.userId} or group with id = ${dto.data.groupId} not found`,
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
export async function getMemberList(req: Request, res: Response){
    const input = {
        userId: req.user?.id,
        groupId: Number(req.params.groupId)
    }
    let errorResponse: ErrorResponse
    const dto = GetMemberListSchema.safeParse(input)

    if(!dto.success) {
        errorResponse = {
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors}
        }
        return res.status(400).json(errorResponse)
    }

    const getMemberListResult = await GroupService.getMemberList(dto.data)
    if(getMemberListResult.success)
        return res.status(200).json(getMemberListResult.data)

    if(getMemberListResult.code == "GROUP_NOT_FOUND"){
        errorResponse = {
            error : "GROUP_NOT_FOUND",
            message : `Group with id = ${dto.data.groupId} not found`,
        }
        return res.status(404).json(errorResponse)
    }

    if(getMemberListResult.code == "NOT_GROUP_MEMBER"){
        errorResponse = {
            error : "NOT_GROUP_MEMBER",
            message : `User with id = ${dto.data.userId} is not a member of group with id = ${dto.data.groupId}`,
        }
        return res.status(403).json(errorResponse)
    }

    errorResponse = {
        error : "SERVER_ERROR",
        message : "Server error",
        detail : {server : ["Server error"]}
    }
    return res.status(500).json(errorResponse)
}
export async function deleteMember(req: Request, res: Response) {
    const input = {memberId : Number(req.params.memberId), hostId : req.user!.id, groupId : Number(req.params.groupId)}
    let errorResponse: ErrorResponse
    const dto = DeleteMemberSchema.safeParse(input)

    if(!dto.success) {
        errorResponse = {
            error : "INVALID_DATA",
            message : "Invalid data",
            detail : {...dto.error.flatten().fieldErrors, ...dto.error.flatten().formErrors}
        }
        return res.status(400).json(errorResponse)
    }

    const serviceResult = await GroupService.deleteMember(dto.data)
    if(serviceResult.success) {
        return res.sendStatus(204)
    }
    if(serviceResult.code == "ONLY_HOST_CAN_DELETE_MEMBER"){
        errorResponse = {
            error : "ONLY_HOST_CAN_DELETE_MEMBER",
            message : "Only host can delete member",
            detail : {permission : ["Only host can delete member"]}
        }
        return res.status(403).json(errorResponse)
    }
    if(serviceResult.code == "HOST_CANNOT_DELETE_HOST"){
        errorResponse = {
            error : "HOST_CANNOT_DELETE_HOST",
            message : "Host cannot delete host",
            detail : {permission : ["Host cannot delete host"]}
        }
        return res.status(403).json(errorResponse)
    }
    errorResponse = {
        error : "SERVER_ERROR",
        message : "Server error",
        detail : {server : ["Server error"]}
    }
    return res.status(500).json(errorResponse)
}