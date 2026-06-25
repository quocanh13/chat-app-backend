import { JWTPayload, ServiceResult } from "../../shared/types.js"
import * as hash from "../../utils/hash.js"
import {UserService} from "user"
import { sign, verify } from "../../utils/jwt.js"

type RegisterCode = "USERNAME_EXISTS" | "INTERNAL_ERROR"
type LoginCode = "USERNAME_NOT_EXISTS" | "INVALID_PASSWORD" | "INTERNAL_ERROR"
type VerifyUserCode = "INVALID_TOKEN" | "TOKEN_EXPIRED"

interface RegisterInput{
    username: string,
    password: string,
    name: string
}
interface LoginInput{
    username: string,
    password: string, 
}

interface RegisterData{
    id : number
}
interface LoginData{
    token : string
}

export async function register(input: RegisterInput) : Promise<ServiceResult<RegisterCode, RegisterData>>{
    let success = false
    let code: RegisterCode | undefined = undefined
    let data = undefined 

    const user = {
        username: input.username,
        passwordHash: await hash.hash(input.password),
        name: input.name
    }
    const createUserResult = await UserService.createUser(user)
    if(createUserResult.success){
        return {success: true, data: createUserResult.data}
    }
    else
        if(createUserResult.code == "USERNAME_EXISTS")
            code = "USERNAME_EXISTS"
        else
            code = "INTERNAL_ERROR"

    return {success, code, data}
}

export async function login(
    input: LoginInput
): Promise<ServiceResult<LoginCode, LoginData>> {
    let success = false
    let code: LoginCode | undefined = undefined

    const getUserByUsernameResult = await UserService.getUserByUsername({
        username : input.username,
        fields : ["passwordHash", "id", "username"]
    })
    if(!getUserByUsernameResult.success){
        if(getUserByUsernameResult.code == "USER_NOT_FOUND")
            code = "USERNAME_NOT_EXISTS"
        else
            code = "INTERNAL_ERROR"
        return {success : false, code}
    } 

    const passwordHash = getUserByUsernameResult.data?.passwordHash
    if(passwordHash == undefined)
        return {success : false, code : "INTERNAL_ERROR"}

    const valid = await hash.compare(input.password, passwordHash)
    if(!valid)
        return {success : false, code : "INVALID_PASSWORD"}
    const data = {token: sign({username: input.username, id: getUserByUsernameResult.data?.id})}
    return {success : true, data}
}

export function verifyUser(token: string) : ServiceResult<VerifyUserCode, JWTPayload>{
    let success = false
    let code: VerifyUserCode | undefined = undefined
    let data = undefined
    const payload = verify(token)
    if(payload == "INVALID_TOKEN")
        code = "INVALID_TOKEN"
    else if(payload == "TOKEN_EXPIRED")
        code = "TOKEN_EXPIRED"
    else{
        success = true
        data = payload
    }
    return {success, code, data}
}
