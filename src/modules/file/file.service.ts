import { File, FileFields, FilePermission, ServiceResult } from "../../shared/types.js";
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
    fileId: number,
    fields?: FileFields[]
}
interface GetFileInformationInput<F extends FileFields[]>{
    fileId : number,
    userId : number,
    fields : F
}

interface CreateFileData {
    id : number
}
type GetFileInformationData<F extends FileFields[]> = {
    [K in F[number]]: File[K]
}
interface GetFilePermissionData<F extends FileFields[]>{
    permission : FilePermission,
    file?: GetFileInformationData<F>
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
export async function getFileInformation<F extends FileFields[]>(
    input: GetFileInformationInput<F>
) : Promise<ServiceResult<GetFileInformationCode, GetFileInformationData<F>>> {
    const getFilePermissionResult = await getFilePermission(input)

    if(!getFilePermissionResult.success){
        if(getFilePermissionResult.code == "FILE_NOT_FOUND")
            return {success : false, code : "FILE_NOT_FOUND"}
        return {success : false, code : "INTERNAL_ERROR"}
    }
    if(!getFilePermissionResult.data?.permission.read)
        return {success : false, code : "ACCESS_DENIED"}

    const getFileByIdResult = await FileRepo.getFileById<F>({
        fileId : input.fileId,
        fields : input.fields
    })

    if(getFileByIdResult.success) {
        return {success : true, data : getFileByIdResult.data}
    }

    if(getFileByIdResult.code == "FILE_NOT_FOUND")
        return {success : false, code : "FILE_NOT_FOUND"}
    else
        return {success : false, code : "INTERNAL_ERROR"}
}
export async function getFilePermission<F extends FileFields[]>(
    input : GetFilePermissionInput
) : Promise<ServiceResult<GetFilePermissionCode, GetFilePermissionData<F>>> {
    let success = false;
    let code : GetFilePermissionCode;
    const permission : FilePermission = {
        read : false, update : false, delete : false, owner : false
    }
    if(!input.fields)
        input.fields = []
    input.fields.push("userId")
    const repoResult = await FileRepo.getFileById({
        fileId : input.fileId, 
        fields : input.fields
    })
    if(repoResult.success){
        if(repoResult.data?.userId == input.userId){
            permission.read = true;
            permission.update = true;
            permission.delete = true;
            permission.owner = true;
        }
        return {success : true, data : {
            permission,
            file : repoResult.data
        }}
    }
    if(repoResult.code == "FILE_NOT_FOUND")
        code = "FILE_NOT_FOUND"
    else{
        code = "INTERNAL_ERROR"
    }

    return {success, code}
}


