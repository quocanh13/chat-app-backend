import { ServiceResponse } from "../../shared/types.js"
import * as GroupRepo from "./group.repository.js"

interface CreateGroupInput {
    name: string,
    type: "direct" | "group"
}
interface CreateGroupData {
    id : number
}
type CreateGroupCode = "NAME_TOO_LONG" | "INVALID_GROUP_TYPE" | "INTERNAL_ERROR" | "OK"
export async function createGroup(group: CreateGroupInput) : Promise<ServiceResponse<CreateGroupCode, CreateGroupData>>{
    let success = false
    let code : CreateGroupCode | undefined = undefined
    let data : CreateGroupData | undefined = undefined

    const repo_res = await GroupRepo.createGroup(group)
    return repo_res
}