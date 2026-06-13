import { ResultSetHeader } from "mysql2";
import pool from "../../configs/database.js";
import { getInsertField } from "../../utils/sql.js";
import { RepoResult } from "../../shared/types.js";
import { PoolConnection } from "mysql2/promise";


type CreateGroupCode = "GROUP_NAME_TOO_LONG" | "INVALID_GROUP_TYPE" | "INTERNAL_ERROR" 
type CreateUserInGroupCode =  "INVALID_ROLE" | "USER_ALREADY_IN_ROOM" | "USER_OR_GROUP_NOT_EXIST" | "INTERNAL_ERROR"

interface CreateGroupInput {
    name: string,
    type: "direct" | "group"
}
interface CreateUserInGroupInput {
    userId : number,
    groupId : number,
    role : "member" | "host"
}

interface CreateGroupResponseData {
    id : number
}
export async function createGroup(
    group: CreateGroupInput, 
    connection: PoolConnection | undefined = undefined
) : Promise<RepoResult<CreateGroupCode, CreateGroupResponseData>>{
    let success = false
    let code : CreateGroupCode | undefined = undefined
    let data : CreateGroupResponseData | undefined = undefined

    const {field, values, placeholder} = getInsertField(group)
    const sql = `INSERT INTO chat_group(${field}) VALUES (${placeholder});`
    if(connection == undefined)
        connection = await pool.getConnection()

    try{
        const res = await connection.query<ResultSetHeader>(sql, values)
        success = true
        data = {id : res[0].insertId}
    } catch(err){
        const e = err as any
        if(e.code == "ER_DATA_TOO_LONG"){
            code = "GROUP_NAME_TOO_LONG"
        } else if(e.code == "WARN_DATA_TRUNCATED"){
            code = "INVALID_GROUP_TYPE"
        } else {
            code = "INTERNAL_ERROR"
            console.log(err)
        }
    } 
    connection.release()
    return {code, success, data}
}

export async function createUserInGroup(
    input: CreateUserInGroupInput, 
    connection : PoolConnection | undefined = undefined
) : Promise<RepoResult<CreateUserInGroupCode>> {
    let success = false
    let code : CreateUserInGroupCode | undefined = undefined
    let data = undefined

    const {field, values, placeholder} = getInsertField(input)
    const sql = `INSERT INTO user_in_group(${field}) VALUES (${placeholder});`
    if(connection == undefined)
        connection = await pool.getConnection()

    try{
        const res = await connection.query<ResultSetHeader>(sql, values)
        success = true
    } catch(err){
        const e = err as any
        if(e.code == "WARN_DATA_TRUNCATED"){
            code = "INVALID_ROLE"
        } else if(e.code == "ER_DUP_ENTRY") {
            code = "USER_ALREADY_IN_ROOM"
        } else if(e.code == "ER_NO_REFERENCED_ROW_2"){
            code = "USER_OR_GROUP_NOT_EXIST"
        } else {
            code = "INTERNAL_ERROR"
            console.log(err)
        }
    } 
    connection.release()
    return {code, success, data}
}

