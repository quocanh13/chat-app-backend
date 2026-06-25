import { FilePermission, ServiceResult } from "../../shared/types.js";
import * as FileRepo from "./file.repository.js"

type CreateFileCode = "INTERNAL_ERROR" | "FILE_NAME_TOO_LONG" | "INVALID_TYPE" | "INVALID_FIELD";
type GetFilePermissionCode = "INTERNAL_ERROR" | "FILE_NOT_FOUND"
type GetFileInformationCode = "INTERNAL_ERROR" | "FILE_NOT_FOUND" | "ACCESS_DENIED"

interface CreateFileInput {
    name: string,
    storedName: string,
    mimeType: string,
    type: "USER_AVATAR" | "GROUP_AVATAR" | "MESSAGE",
    size: number,
    userId: number
}
interface GetFilePermissionInput{
    userId : number, 
    fileId: number
}
interface GetFileInformationInput{
    fileId : number,
    userId : number
}

interface CreateFileData {
    id : number
}
interface GetFilePermissionData{
    permission : FilePermission
}
interface GetFileInformationData{
    id: number,
    name: string,
    storedName: string,
    mimeType: string,
    type: "USER_AVATAR" | "GROUP_AVATAR" | "MESSAGE",
    size: number,
    userId: number,
}

export async function createFile(
    input: CreateFileInput
) : Promise<ServiceResult<CreateFileCode, CreateFileData>> {
    
    const createFileResult = await FileRepo.createFile(input)
    if(createFileResult.success)
        return {success : true, data: createFileResult.data}

    if(createFileResult.code == "FILE_NAME_TOO_LONG")
        return {success : false, code : "FILE_NAME_TOO_LONG"}
    else if(createFileResult.code == "INVALID_FIELD")
        return {success : false, code : "INVALID_FIELD"}
    else if(createFileResult.code == "INVALID_TYPE")
        return {success : false, code : "INVALID_TYPE"}
    else 
        return {success : false, code : "INTERNAL_ERROR"}
}

export async function getFilePermission(
    input : GetFilePermissionInput
) : Promise<ServiceResult<GetFilePermissionCode, GetFilePermissionData>> {
    let success = false;
    let code : GetFilePermissionCode;
    const permission : FilePermission = {
        read : false, update : false, delete : false, owner : false
    }
    const repoResult = await FileRepo.getFileById({fileId : input.fileId, fields : ["userId"]})
    if(repoResult.success){
        if(repoResult.data?.userId == input.userId){
            permission.read = true;
            permission.update = true;
            permission.delete = true;
            permission.owner = true;
        }
        return {success : true, data : {permission}}
    }
    if(repoResult.code == "FILE_NOT_FOUND")
        code = "FILE_NOT_FOUND"
    else{
        code = "INTERNAL_ERROR"
    }

    return {success, code}
}

export async function getFileInformation(
    input: GetFileInformationInput
) : Promise<ServiceResult<GetFileInformationCode, GetFileInformationData>> {
    const getFilePermissionResult = await getFilePermission(input)

    if(!getFilePermissionResult.success){
        if(getFilePermissionResult.code == "FILE_NOT_FOUND")
            return {success : false, code : "FILE_NOT_FOUND"}
        return {success : false, code : "INTERNAL_ERROR"}
    }
    if(!getFilePermissionResult.data?.permission.read)
        return {success : false, code : "ACCESS_DENIED"}

    const getFileByIdResult = await FileRepo.getFileById({
        fileId : input.fileId,
        fields : ["id", "mimeType", "name", "storedName", "size", "type", "userId"]
    })

    if(getFileByIdResult.success) {
        return {success : true, data : getFileByIdResult.data}
    }

    if(getFileByIdResult.code == "FILE_NOT_FOUND")
        return {success : false, code : "FILE_NOT_FOUND"}
    else
        return {success : false, code : "INTERNAL_ERROR"}
}
