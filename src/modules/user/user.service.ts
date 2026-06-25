import * as UserRepo from "./user.repository.js"
import { ServiceResult, User, UserFields } from "../../shared/types.js"
import { getFilePermission} from "../file/index.js"

type CreateUserCode = "USERNAME_EXISTS" | "INTERNAL_ERROR"
type GetUserByIdCode = "USER_NOT_FOUND" | "INTERNAL_ERROR"
type UpdateUserCode = "USER_NOT_FOUND" | "INVALID_DATA" | "AVATAR_ACCESS_DENIED" | "INTERNAL_ERROR" | "EMPTY_FIELD"


interface CreateUserInput{
    username: string,
    passwordHash: string,
    name: string,
}
interface UpdateUserInput{
    id: number
    username?: string,
    passwordHash?: string,
    email?: string,
    name?: string,
    avatarFileId?: number | null
}
interface GetUserByIdInput<F extends UserFields[]>{
    id : number,
    fields : F
}
interface GetUserByUsernameInput<F extends UserFields[]>{
    username : string,
    fields : F
}


interface CreateUserData{
    id : number
}
type GetUserData<F extends UserFields[]> = {
    [K in F[number]]: User[K]
}


export async function createUser(
    input: CreateUserInput
) : Promise<ServiceResult<CreateUserCode, CreateUserData>>{
    let code: CreateUserCode | undefined = undefined

    const createUserResult = await UserRepo.createUser({
        user : input, 
        fields : ["username", "passwordHash", "name"]
    })
    if(createUserResult.success){
        return {success : true, data : createUserResult.data}
    }

    if(createUserResult.code == "DUPLICATE_ENTRY")
        code = "USERNAME_EXISTS"
    else
        code = "INTERNAL_ERROR"

    return {success : false, code}
}

export async function getUserById<F extends UserFields[]>(
    input: GetUserByIdInput<F>
) : Promise<ServiceResult<GetUserByIdCode, GetUserData<F>>> {
    let code: GetUserByIdCode | undefined = undefined

    const res = await UserRepo.getUserById(input)
    if(res.success) {
        return {success : true, data : res.data}
    }
    else
        if(res.code == "USER_NOT_FOUND")
            code = "USER_NOT_FOUND"
        else
            code = "INTERNAL_ERROR"

    return {success : false, code}
}

export async function getUserByUsername<F extends UserFields[]>(
    input: GetUserByUsernameInput<F>
) : Promise<ServiceResult<GetUserByIdCode,  GetUserData<F>>> {
    let code: GetUserByIdCode | undefined = undefined

    const res = await UserRepo.getUserByUsername(input)
    if(res.success) {
        return {success : true, data : res.data}
    }
    else
        if(res.code == "USER_NOT_FOUND")
            code = "USER_NOT_FOUND"
        else
            code = "INTERNAL_ERROR"

    return {success : false, code}
}

export async function updateUser(
    input: UpdateUserInput
) : Promise<ServiceResult<UpdateUserCode>> {
    let success = false
    let code: UpdateUserCode | undefined = undefined
    if(input.avatarFileId != undefined && input.avatarFileId != null){
        const getFilePermissionResult = await getFilePermission({userId : input.id, fileId : input.avatarFileId})
        if(getFilePermissionResult.success && !getFilePermissionResult.data?.permission.owner){
            return {success : false, code : "AVATAR_ACCESS_DENIED"}
        }
    }

    const updateUserByIdResult = await UserRepo.updateUserById(input)
    if(updateUserByIdResult.success)
        return {success : true}

    if(updateUserByIdResult.code == "USER_NOT_FOUND")
        code = "USER_NOT_FOUND"
    else if(updateUserByIdResult.code == "EMPTY_FIELD")
        code = "EMPTY_FIELD"
    
    return {success, code}
}