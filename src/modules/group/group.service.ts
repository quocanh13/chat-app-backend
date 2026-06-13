import { PoolConnection } from "mysql2/promise"
import { queryTransaction } from "../../configs/transaction.js"
import { RepoResult, ServiceResult } from "../../shared/types.js"
import * as GroupRepo from "./group.repository.js"

interface CreateGroupInput {
    name: string,
    hostId : number,
}
interface CreateGroupData {
    id : number
}
type CreateGroupCode =  
    "GROUP_NAME_TOO_LONG" | "USER_ALREADY_IN_ROOM" | "INVALID_ROLE" |
    "INVALID_GROUP_TYPE" | "USER_OR_GROUP_NOT_EXIST" | "INTERNAL_ERROR" | "OK"

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