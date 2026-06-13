import { email } from "zod"
import { ServiceResponse } from "../../shared/types.js"
import * as hash from "../../utils/hash.js"
import * as authRepo from "./auth.repository.js"
import { sign } from "../../utils/jwt.js"

interface RegisterInput{
    username: string,
    password: string,
    name: string
}
type RegisterCode = "USERNAME_EXISTS" | "INTERNAL_ERROR"
export async function register(input: RegisterInput) : Promise<ServiceResponse<RegisterCode | undefined>>{
    let success = false
    let code: RegisterCode | undefined = undefined
    let data = undefined 

    const user = {
        username: input.username,
        passwordHash: await hash.hash(input.password),
        name: input.name
    }
    const res = await authRepo.createUser(user, ["username", "passwordHash", "name"])
    if(res.success)
        success = true 
    else
        if(res.code == "DUPLICATE_ENTRY")
            code = "USERNAME_EXISTS"
        else
            code = "INTERNAL_ERROR"

    return {success, code, data}
}

interface LoginInput{
    username: string,
    password: string, 
}
type LoginCode = "USERNAME_NOT_EXISTS" | "INVALID_PASSWORD" | "INTERNAL_ERROR"
export async function login(input: LoginInput) {
    let success = false
    let code: LoginCode | undefined = undefined
    let data = undefined 

    const repo_res = await authRepo.getUserByUsername(input.username, ["passwordHash", "id"])
    if(!repo_res.success){
        if(repo_res.code == "USER_NOT_FOUND")
            code = "USERNAME_NOT_EXISTS"
        else
            code = "INTERNAL_ERROR"
    } else {
        const passwordHash = repo_res.data?.passwordHash
        if(passwordHash == undefined)
            code = "INTERNAL_ERROR"
        else{
            const valid = await hash.compare(input.password, passwordHash)
            if(valid){
                success = true
                data = {
                    token: sign({username: input.username, id: repo_res.data?.id})
                }
            } else {
                code = "INVALID_PASSWORD"
            }
        }
    }
    return {success, code, data}
}