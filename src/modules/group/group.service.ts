import { PoolConnection } from "mysql2/promise"
import { queryTransaction } from "../../configs/transaction.js"
import { RepoResult, ServiceResult } from "../../shared/types.js"
import * as GroupRepo from "./group.repository.js"


interface CreateGroupInput {
    name: string,
    hostId : number,
}
interface GetGroupByIdInput {
    groupId : number,
    userId : number,
    includeMember: boolean
}
interface IsHostInput {
    userId: number,
    groupId : number
}
interface IsMemberInput {
    userId: number,
    groupId : number
}
interface AddUserToGroupInput {
    groupId : number,
    userId : number,
    hostId : number
}

interface CreateGroupData {
    id : number
}
interface MemberData{
    userId : number,
    role : "direct" | "host",
}
interface GetGroupByIdData {
    id? : number,
    name? : string,
    type? : "direct" | "group",
    members? : MemberData[]
}

type CreateGroupCode =  
    "GROUP_NAME_TOO_LONG" | "USER_ALREADY_IN_GROUP" | "INVALID_ROLE" |
    "INVALID_GROUP_TYPE" | "USER_OR_GROUP_NOT_EXIST" | "INTERNAL_ERROR"
type GetGroupByIdCode = "GROUP_NOT_EXISTS" | "ONLY_MEMBER_CAN_ACCESS" | "INTERNAL_ERROR"
type IsHostCode = "INTERNAL_ERROR"
type IsMemberCode = "INTERNAL_ERROR"
type AddUserToGroupCode = "ONLY_HOST_CAN_ADD_MEMBER" | "USER_OR_GROUP_NOT_EXIST" | "USER_ALREADY_IN_GROUP"  | "INTERNAL_ERROR"


export async function createGroup(input: CreateGroupInput) : Promise<ServiceResult<CreateGroupCode, CreateGroupData>>{
    const {name, hostId} = input

    const transactionResult = await queryTransaction(async (connection)=>{
        const createGroupResult = await GroupRepo.createGroup({name, type : "group"}, connection)
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

async function isMember(input : IsMemberInput) : Promise<ServiceResult<IsMemberCode, {isMember : boolean}>> {
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

async function isHost(input : IsHostInput) : Promise<ServiceResult<IsHostCode, {isHost : boolean}>> {
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

export async function getGroup(input: GetGroupByIdInput) : Promise<ServiceResult<GetGroupByIdCode, GetGroupByIdData>> {
    let success = false
    let code : GetGroupByIdCode | undefined = undefined
    let data : GetGroupByIdData | undefined = undefined
    const isMemberResult = await isMember(input)
    if(!isMemberResult.success)
        return {code : "INTERNAL_ERROR", success}
    if(!isMemberResult.data?.isMember)
        return {code : "ONLY_MEMBER_CAN_ACCESS" , success}
    
        
    const getGroupByIdResult = await GroupRepo.getGroupById({id : input.groupId, field : ["id", "name", "type", "lastMessageId"]})
    if(!getGroupByIdResult.success){
        if(getGroupByIdResult.code == "GROUP_NOT_EXIST")
            code = "GROUP_NOT_EXISTS"
        else
            code = "INTERNAL_ERROR"
        return {code, success}
    }

    data = {...getGroupByIdResult.data}
    if(!input.includeMember)
        return {success : true, data}

    const getMemberResult = await GroupRepo.getMembers(input)
    if(getMemberResult.success){
        data.members = getMemberResult.data
        return {success : true, data}
    }

    return {code : "INTERNAL_ERROR", success}
}

export async function addUserToGroup(input : AddUserToGroupInput) : Promise<ServiceResult<AddUserToGroupCode>> {
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
    else if(repoResult.code == "USER_OR_GROUP_NOT_EXIST")
        code = "USER_OR_GROUP_NOT_EXIST"
    else
        code = "INTERNAL_ERROR"
    return {success, code}
}