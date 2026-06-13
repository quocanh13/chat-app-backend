import * as UserRepo from "./user.repository.js"
import { idToURL } from "../../utils/file.js"
import { FilePermission, ServiceResponse } from "../../shared/types.js"

type GetUserByIdCode = "USER_NOT_FOUND" | "INTERNAL_ERROR"
type UpdateUserCode = "USER_NOT_FOUND" | "INVALID_DATA" | "AVATAR_ACCESS_DENIED" | "INTERNAL_ERROR" | "EMPTY_FIELD"

interface GetUserData{
    username: string,
    email: string,
    name: string,
    avatar: string
}

interface UpdateUserInput{
    id: number
    username?: string,
    passwordHash?: string,
    email?: string,
    name?: string,
    avatarFileId?: number
}

export async function getUserById(id: number) : Promise<ServiceResponse<GetUserByIdCode,  GetUserData>> {
    let success = false
    let code: GetUserByIdCode | undefined = undefined
    let data = undefined

    const res = await UserRepo.getUserById(id, ["username", "name", "avatarFileId", "email"])
    if(res.success) {
        success = true 
        data = {
            username: res.data!.username,
            name: res.data!.name,
            email: res.data!.email,
            avatar: idToURL(res.data?.avatarFileId)
        }
    }
    else
        if(res.code == "USER_NOT_FOUND")
            code = "USER_NOT_FOUND"
        else
            code = "INTERNAL_ERROR"

    return {success, code, data}
}

async function getFilePermission(userId : number, fileId: number) : Promise<FilePermission> {
    const permission : FilePermission = {
        read : false, update : false, delete : false
    }
    const repo = await UserRepo.getFileById(fileId, ["userId"])
    if(repo.success){
        if(repo.data?.userId == userId){
            permission.read = true;
            permission.update = true;
            permission.delete = true;
        }
    }
    return permission
}

export async function updateUser(user: UpdateUserInput) : Promise<ServiceResponse<UpdateUserCode>> {
    let success = false
    let code: UpdateUserCode | undefined = undefined
    let data = undefined
    if(user.avatarFileId != undefined){
        const permission = await getFilePermission(user.id, user.avatarFileId)
        if(!permission.read){
            code = "AVATAR_ACCESS_DENIED"
            return {success, code, data}
        }
    }

    const repo_res = await UserRepo.updateUser(user)
    if(!repo_res.success){
        if(repo_res.code == "USER_NOT_FOUND")
            code = "USER_NOT_FOUND"
        else if(repo_res.code == "EMPTY_FIELD") {
            code = "EMPTY_FIELD"
        }
    } else {
        success = true
    }
    return {success, code, data}
}