import { email } from "zod"
import { ServiceResponse } from "../../shared/types.js"
import { hash } from "../../utils/hash.js"
import * as userRepo from "./user.repository.js"
import { idToURL } from "../../utils/file.js"

interface User{
    username: string,
    password: string,
    name: string
}

type RegisterCode = "USERNAME_EXISTS" | "INTERNAL_ERROR"
type GetUserByIdCode = "USER_NOT_FOUND" | "INTERNAL_ERROR"

export async function register(input: User) : Promise<ServiceResponse<RegisterCode | undefined>>{
    let success = false
    let code: RegisterCode | undefined = undefined
    let data = undefined 

    const user = {
        username: input.username,
        password_hash: await hash(input.password),
        name: input.name
    }
    const res = await userRepo.create(user)
    if(res.success)
        success = true 
    else
        if(res.code == "DUPLICATE_ENTRY")
            code = "USERNAME_EXISTS"
        else
            code = "INTERNAL_ERROR"

    return {success, code, data}
}

export async function getUserById(id: number) {
    let success = false
    let code: GetUserByIdCode | undefined = undefined
    let data = undefined

    const res = await userRepo.getUserById(id, ["username", "name", "avatarFileId", "email"])
    if(res.success) {
        success = true 
        data = {
            username: res.data?.username,
            name: res.data?.name,
            email: res.data?.email,
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