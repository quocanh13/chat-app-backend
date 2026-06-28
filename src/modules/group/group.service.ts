import { queryTransaction } from "../../utils/sql.js"
import { ServiceResult } from "../../shared/types.js"
import { getFilePermission } from "file"
import * as GroupRepo from "./group.repository.js"

type CreateGroupCode =  
    "GROUP_NAME_TOO_LONG" | "USER_ALREADY_IN_GROUP" | "INVALID_ROLE" |
    "INVALID_GROUP_TYPE" | "USER_OR_GROUP_NOT_FOUND" | "INTERNAL_ERROR"
type GetGroupByIdCode = "GROUP_NOT_FOUND" | "ONLY_MEMBER_CAN_ACCESS" | "INTERNAL_ERROR"
type UpdateGroupCode = 
    "GROUP_NOT_FOUND" | "ONLY_HOST_CAN_UPDATE" | "AVATAR_ACCESS_DENIED" | "AVATAR_NOT_FOUND" | 
    "EMPTY_FIELD" | "INTERNAL_ERROR"
type IsHostCode = "INTERNAL_ERROR"
type IsMemberCode = "INTERNAL_ERROR"
type AddUserToGroupCode = "ONLY_HOST_CAN_ADD_MEMBER" | "USER_OR_GROUP_NOT_FOUND" | "USER_ALREADY_IN_GROUP"  | "INTERNAL_ERROR"
type GetMemberListCode = "INTERNAL_ERROR" | "NOT_GROUP_MEMBER" | "GROUP_NOT_FOUND"
type DeleteMemberCode = "ONLY_HOST_CAN_DELETE_MEMBER" | "HOST_CANNOT_DELETE_HOST" | "INTERNAL_ERROR"

interface CreateGroupInput {
    name: string,
    hostId : number,
}
interface GetGroupInput {
    groupId : number,
    userId : number,
}
interface UpdateGroupInput{
    groupId : number,
    name? : string,
    userId : number,
    avatarFileId? : number | null
}
interface IsHostInput {
    userId: number,
    groupId : number
}
interface IsMemberInput {
    userId: number,
    groupId : number
}
interface AddMemeberToGroupInput {
    groupId : number,
    userId : number,
    hostId : number
}
interface GetMemberListInput{
    groupId: number,
    userId: number
}
interface DeleteMemberInput {
    groupId : number,
    memberId : number,
    hostId : number
}

interface CreateGroupData {
    id : number
}
interface MemberData{
    userId : number,
    role : "member" | "host",
}
interface GetMemberListData{
    members: MemberData[]
}
interface GetGroupByIdData {
    id? : number,
    name? : string,
    avatarFileId?: number | null 
}


export async function createGroup(
    input: CreateGroupInput
) : Promise<ServiceResult<CreateGroupCode, CreateGroupData>>{
    const {name, hostId} = input

    const transactionResult = await queryTransaction(async (connection)=>{
        const createGroupResult = await GroupRepo.createGroup({name}, connection)
        if(createGroupResult.success){
            const groupId = createGroupResult.data?.id!
            const createUserInGroupResult = await GroupRepo.createUserInGroup({groupId, userId : hostId, role : "host"})    
            if(createUserInGroupResult.success){
                return {success : true, data : {id : groupId}}
            }
            return createUserInGroupResult
        }
        return createGroupResult
    })
    return transactionResult
}

export async function getGroup(
    input: GetGroupInput
) : Promise<ServiceResult<GetGroupByIdCode, GetGroupByIdData>> {
    let success = false
    let code : GetGroupByIdCode | undefined = undefined

    const isMemberResult = await isMember(input)
    if(!isMemberResult.success)
        return {code : "INTERNAL_ERROR", success}
    if(!isMemberResult.data?.isMember)
        return {code : "ONLY_MEMBER_CAN_ACCESS" , success}
    
        
    const getGroupByIdResult = await GroupRepo.getGroupById({id : input.groupId, field : ["id", "name", "lastMessageId", "avatarFileId"]})
    if(getGroupByIdResult.success)
        return {success : true, data : getGroupByIdResult.data}
    
    if(getGroupByIdResult.code == "GROUP_NOT_FOUND")
        code = "GROUP_NOT_FOUND"
    else
        code = "INTERNAL_ERROR"
    return {code, success}
}

export async function isMember(
    input : IsMemberInput
) : Promise<ServiceResult<IsMemberCode, {isMember : boolean}>> {
    let success = false
    let code : IsHostCode | undefined = undefined
    let data = {isMember : false}
    const repoResult = await GroupRepo.getUserInGroupByKey({groupId : input.groupId, userId : input.userId, field: ["role"]})
    if(repoResult.success){
        success = true
        data.isMember = true
    } else {
        if(repoResult.code == "USER_NOT_IN_GROUP"){
            success = true
        } else {
            success = false
            code = "INTERNAL_ERROR"
        }
    }
    return {success, code, data}
}

export async function isHost(
    input : IsHostInput
) : Promise<ServiceResult<IsHostCode, {isHost : boolean}>> {
    let success = false
    let code : IsHostCode | undefined = undefined
    let data = {isHost : false}
    const repoResult = await GroupRepo.getUserInGroupByKey({groupId : input.groupId, userId : input.userId, field: ["role"]})
    if(repoResult.success && repoResult.data?.role == "host"){
        success = true
        data.isHost = true
    } else {
        if(repoResult.code == "USER_NOT_IN_GROUP"){
            success = true
        } else {
            success = false
            code = "INTERNAL_ERROR"
        }
    }
    return {success, code, data}
}

export async function updateGroup(
    input: UpdateGroupInput
) : Promise<ServiceResult<UpdateGroupCode>> {
    let success = false
    let code : UpdateGroupCode | undefined = undefined

    if(input.avatarFileId){
        const getFilePermissionResult = await getFilePermission({fileId : input.avatarFileId, userId : input.userId})
        if(getFilePermissionResult.success && !getFilePermissionResult.data?.permission.owner)
            return {success, code : "AVATAR_ACCESS_DENIED"}
        if(getFilePermissionResult.code == "FILE_NOT_FOUND")
            return {success, code : "AVATAR_NOT_FOUND"}
    }

    const isHostResult = await isHost({groupId: input.groupId, userId : input.userId})
    console.log(isHostResult)
    if(!isHostResult.success){
        return {success, code : "INTERNAL_ERROR"}
    }
    if(!isHostResult.data?.isHost)
        return {success, code : "ONLY_HOST_CAN_UPDATE"}

    const updateGroupResult = await GroupRepo.updateGroupById({id : input.groupId, name : input.name}, ["name"])
    if(updateGroupResult.success){
        return {success : true}
    }
    
    if(updateGroupResult.code == "GROUP_NOT_FOUND")
        code = "GROUP_NOT_FOUND"
    else if(updateGroupResult.code == "EMPTY_FIELD")
        code = "EMPTY_FIELD"
    else 
        code = "INTERNAL_ERROR"
    return {success, code}
}

export async function addUserToGroup(
    input : AddMemeberToGroupInput
) : Promise<ServiceResult<AddUserToGroupCode>> {
    let success = false
    let code : AddUserToGroupCode | undefined = undefined
    const isHostResult = await isHost({groupId: input.groupId, userId : input.hostId})
    if(!isHostResult.success){
        return {success, code : "INTERNAL_ERROR"}
    }
    if(!isHostResult.data?.isHost)
        return {success, code : "ONLY_HOST_CAN_ADD_MEMBER"}
    
    const repoResult = await GroupRepo.createUserInGroup({
        groupId : input.groupId, 
        userId : input.userId, 
        role : "member"
    })
    if(repoResult.success){
        return {success : true}
    }
    if(repoResult.code == "USER_ALREADY_IN_GROUP")
        code = "USER_ALREADY_IN_GROUP"
    else if(repoResult.code == "USER_OR_GROUP_NOT_FOUND")
        code = "USER_OR_GROUP_NOT_FOUND"
    else
        code = "INTERNAL_ERROR"
    return {success, code}
}

export async function getMemberList(
    input : GetMemberListInput
) : Promise<ServiceResult<GetMemberListCode, GetMemberListData>> {
    const isMemberResult = await isMember(input)
    if(!isMemberResult.success){
        if(isMemberResult.code == "INTERNAL_ERROR")
            return {success : false, code : "INTERNAL_ERROR"}
    }

    if(!isMemberResult.data?.isMember)
        return {success : false, code : "NOT_GROUP_MEMBER"}

    const getUserInGroupByGroupIdResult = await GroupRepo.getUserInGroupByGroupId(input)
    if(getUserInGroupByGroupIdResult.success)
        return {
            success : true, 
            data : {
                members : getUserInGroupByGroupIdResult.data ? getUserInGroupByGroupIdResult.data : []
            }
        }
    if(getUserInGroupByGroupIdResult.code == "GROUP_NOT_FOUND")
        return {success : false, code : "GROUP_NOT_FOUND"}

    return {success : false, code : "INTERNAL_ERROR"}
}

export async function deleteMember(
    input : DeleteMemberInput
) : Promise<ServiceResult<DeleteMemberCode>> {
    let success = false
    let code : AddUserToGroupCode | undefined = undefined
    const isHostResult = await isHost({groupId: input.groupId, userId : input.hostId})
    if(!isHostResult.success){
        return {success, code : "INTERNAL_ERROR"}
    }
    if(!isHostResult.data?.isHost)
        return {success, code : "ONLY_HOST_CAN_DELETE_MEMBER"}
    
    if(input.hostId == input.memberId){
        return {success : false, code : "HOST_CANNOT_DELETE_HOST"}
    }

    const repoResult = await GroupRepo.deleteUserInGroupByKey(input)
    if(repoResult.success){
        return {success : true}
    }
    return {success, code : "INTERNAL_ERROR"}  
}