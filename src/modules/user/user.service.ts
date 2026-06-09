import * as userRepo from "./user.repository.js"
import { idToURL } from "../../utils/file.js"
import { verify } from "../../utils/jwt.js"

type GetUserByIdCode = "USER_NOT_FOUND" | "INTERNAL_ERROR"

export function verifyUser(token: string) : "INVALID_TOKEN" | {id: number, username: string}{
    const payload = verify(token)
    if(payload == "INVALID_TOKEN")
        return "INVALID_TOKEN"
    return payload
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