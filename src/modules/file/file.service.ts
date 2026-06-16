import { FilePermission, ServiceResult } from "../../shared/types.js";
import * as FileRepo from "./file.repository.js"

type GetFilePermissionCode = "INTERNAL_ERROR" | "FILE_NOT_FOUND"

interface GetFilePermissionInput{
    userId : number, 
    fileId: number
}

interface GetFilePermissionData{
    permission : FilePermission
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
            return {success : true, data : {permission}}
        }
    }
    if(repoResult.code == "FILE_NOT_FOUND")
        code = "FILE_NOT_FOUND"
    else
        code = "INTERNAL_ERROR"

    return {success, code}
}