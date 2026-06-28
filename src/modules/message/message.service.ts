import { ServiceResult } from "../../shared/types.js"
import { isMember } from "group"
import { getFilePermission } from "file"
import * as MessageRepo from "./message.repository.js"

type SendMessageCode = "INTERNAL_ERROR" | "USER_NOT_MEMBER" | "FILE_NOT_FOUND" | "FILE_ACCESS_DENIED" | "CONTENT_TOO_LONG"

interface SendMessageInput{
    userId: number,
    groupId: number,
    fileId?: number | null,
    content: string
}

interface SendMessageData{
    id: number
}

export async function sendMessage(
    input : SendMessageInput
) : Promise<ServiceResult<SendMessageCode, SendMessageData>> {

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

    if(input.fileId != null && input.fileId != undefined){
        const filePermissionResult = await getFilePermission({
            userId : input.userId,
            fileId : input.fileId,
            fields : ["name"]
        })
        if(!filePermissionResult.success){
            if(filePermissionResult.code == "FILE_NOT_FOUND")
                return {success : false, code : "FILE_NOT_FOUND"}
        }
        if(!filePermissionResult.data?.permission.owner)
            return {success : false, code : "FILE_ACCESS_DENIED"}

        input.content = filePermissionResult.data.file!.name
    }

    const sendMessageResult = await MessageRepo.createMessage(input)
    if(sendMessageResult.success)
        return {success : true, data : sendMessageResult.data}

    let code: SendMessageCode
    if(sendMessageResult.code == "DATA_TOO_LONG")
        code = "CONTENT_TOO_LONG"
    else
        code = "INTERNAL_ERROR"
    return {success : false, code}
}