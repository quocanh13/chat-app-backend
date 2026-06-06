import { email } from "zod"
import { ServiceResponse } from "../../shared/types.js"
import { hash } from "../../utils/hash.js"
import * as authRepo from "./auth.repository.js"

interface User{
    username: string,
    password: string,
    name: string
}

type RegisterCode = "USERNAME_EXISTS" | "INTERNAL_ERROR"

export async function register(input: User) : Promise<ServiceResponse<RegisterCode | undefined>>{
    let success = false
    let code: RegisterCode | undefined = undefined
    let data = undefined 

    const user = {
        username: input.username,
        password_hash: await hash(input.password),
        name: input.name
    }
    const res = await authRepo.create(user)
    if(res.success)
        success = true 
    else
        if(res.code == "DUPLICATE_ENTRY")
            code = "USERNAME_EXISTS"
        else
            code = "INTERNAL_ERROR"

    return {success, code, data}
}