import { ServiceResult } from "../../shared/types.js"
import { isMember } from "group"
import { getFilePermission } from "file"
import * as MessageRepo from "./message.repository.js"

type SendMessageCode = "INTERNAL_ERROR" | "USER_NOT_MEMBER" | "FILE_NOT_FOUND" | "FILE_ACCESS_DENIED"

interface SendMessageInput{
    userId: number,
    groupId: number,
    fileId: number | null,
    content: string
}

export async function sendMessage(
    input : SendMessageInput
) : Promise<ServiceResult<SendMessageCode>> {

    const isMemberResult = await isMember({
        groupId : input.groupId, 
        userId : input.userId
    })

    if(!isMemberResult.success){
        if(isMemberResult.code == "INTERNAL_ERROR")
            return {success : false, code : "INTERNAL_ERROR"}
    }

    if(!isMemberResult.data?.isMember)
        return {success : false, code : "USER_NOT_MEMBER"}

    if(input.fileId != null){
        const filePermissionResult = await getFilePermission(input)
        if(!filePermissionResult.success){
            if(filePermissionResult.code == "FILE_NOT_FOUND")
                return {success : false, code : "FILE_NOT_FOUND"}
        }
        if(!filePermissionResult.data?.permission.owner)
            return {success : false, code : "FILE_ACCESS_DENIED"}
    }

    const sendMessageResult = await MessageRepo.createMessage(input)
    if(sendMessageResult.success)
        return {success : true}

    let code: SendMessageCode
    if(sendMessageResult.code == "INTERNAL_ERROR")
        code = "INTERNAL_ERROR"
    else
        code = "INTERNAL_ERROR"
    return {success : false, code}
}