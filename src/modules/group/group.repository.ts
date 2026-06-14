import { ResultSetHeader } from "mysql2";
import pool from "../../configs/database.js";
import { getGetField, getInsertField } from "../../utils/sql.js";
import { GroupFields, RepoResult, Group, UserInGroupFields, UserInGroup } from "../../shared/types.js";
import { FieldPacket, PoolConnection, QueryResult, RowDataPacket } from "mysql2/promise";
import { number, success } from "zod";

type CreateGroupCode = "GROUP_NAME_TOO_LONG" | "INVALID_GROUP_TYPE" | "INTERNAL_ERROR" 
type CreateUserInGroupCode =  "INVALID_ROLE" | "USER_ALREADY_IN_GROUP" | "USER_OR_GROUP_NOT_EXIST" | "INTERNAL_ERROR"
type GetMembersCode = "GROUP_NOT_EXIST" | "INTERNAL_ERROR"
type GetGroupByIdCode =  "GROUP_NOT_EXIST" | "INVALID_FIELD" | "INTERNAL_ERROR"
type GetUserInGroupCode = "USER_NOT_IN_GROUP" | "INVALID_FIELD" | "INTERNAL_ERROR"


interface CreateGroupInput {
    name: string,
    type: "direct" | "group"
}
interface CreateUserInGroupInput {
    userId : number,
    groupId : number,
    role : "member" | "host"
}
interface GetMembersInput{
    groupId : number
}
interface GetGroupByIdInput<F extends GroupFields[]> {
    id : number,
    field?: F
}
interface GetUserInGroupInput<F extends UserInGroupFields[]> {
    userId: number,
    groupId: number,
    field?: F
}


interface MemberData{
    userId : number,
    role : "direct" | "host",
}
interface CreateGroupResponseData {
    id : number
}
type GetGroupData<F extends GroupFields[]> = {
    [K in F[number]]: Group[K]
}
type GetUserInGroupData<F extends UserInGroupFields[]> = {
    [K in F[number]]: UserInGroup[K]
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
            code = "USER_ALREADY_IN_GROUP"
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

export async function getMembers(
    input: GetMembersInput
) : Promise<RepoResult<GetMembersCode, MemberData[]>> {
    const sql = `SELECT user_id as userId, role FROM user_in_group WHERE group_id = ?;`
    try {
        const [rows, packet] = await pool.query<RowDataPacket[]>(sql, [input.groupId])
        if(rows.length <= 0){
            return {success : false, code : "GROUP_NOT_EXIST"}
        }
        const data = rows as MemberData[]
        return {success: true, data}
    } catch (err){
        let code: GetMembersCode
        code = "INTERNAL_ERROR"
        const e = err as any
        return {success : false, code}
    }
}

export async function getGroupById<F extends GroupFields[]>(
    input : GetGroupByIdInput<F>
) : Promise<RepoResult<GetGroupByIdCode, GetGroupData<F>>> {
    let success = false
    let code : GetGroupByIdCode | undefined = undefined
    let data : GetGroupData<F> | undefined = undefined
    let fields : string
    if(input.field == undefined)
        fields = "id, name, type, last_message_id as lastMessageId, created_at as createdAt"
    else
        fields = getGetField(input.field)
    
    const sql = `SELECT ${fields} FROM chat_group WHERE id = ?;`
    try {
        const [rows, packet] = await pool.query<RowDataPacket[]>(sql, input.id)
        success = true
        if(rows.length <= 0) {
            code = "GROUP_NOT_EXIST"
        } else data = rows[0] as GetGroupData<F>
    } catch (err){
        const e = err as any
        if(e.code == 'ER_BAD_FIELD_ERROR')
            code = "INVALID_FIELD"
        else{
            code = "INTERNAL_ERROR"
            console.log(err)
        }
    }
    return {success, code, data}
}

export async function getUserInGroupByKey<F extends UserInGroupFields[]>(
    input : GetUserInGroupInput<F>
) : Promise<RepoResult<GetUserInGroupCode, GetUserInGroupData<F>>>  {
    let success = false
    let code : GetUserInGroupCode | undefined = undefined
    let data : GetUserInGroupData<F> | undefined = undefined
    let fields : string
    if(input.field == undefined)
        fields = "user_id as userId, group_id as groupId, role, joined_at as joinAt"
    else
        fields = getGetField(input.field)
    
    const sql = `SELECT ${fields} FROM user_in_group WHERE user_id = ? AND group_id = ?;`
    try {
        const [rows, packet] = await pool.query<RowDataPacket[]>(sql, [input.userId, input.groupId])
        success = true
        if(rows.length <= 0) {
            success = false
            code = "USER_NOT_IN_GROUP"
        } else data = rows[0] as GetUserInGroupData<F>
    } catch (err){
        const e = err as any
        if(e.code == 'ER_BAD_FIELD_ERROR')
            code = "INVALID_FIELD"
        else{
            code = "INTERNAL_ERROR"
            console.log(err)
        }
    }
    return {success, code, data}
}

