import { ResultSetHeader } from "mysql2";
import pool from "../../configs/database.js";
import { getGetField, getInsertField, getUpdateField } from "../../utils/sql.js";
import { GroupFields, RepoResult, Group, UserInGroupFields, UserInGroup } from "../../shared/types.js";
import { PoolConnection, RowDataPacket } from "mysql2/promise";

type CreateGroupCode = "GROUP_NAME_TOO_LONG" | "INVALID_GROUP_TYPE" | "INTERNAL_ERROR" 
type GetGroupByIdCode =  "GROUP_NOT_FOUND" | "INVALID_FIELD" | "INTERNAL_ERROR"
type UpdateGroupByIdCode = "GROUP_NOT_FOUND" | "SYNTAX_ERROR" |"INVALID_FIELD" | "REFERENCE_ERROR" | "EMPTY_FIELD" | "INTERNAL_ERROR"
type CreateUserInGroupCode =  "INVALID_ROLE" | "USER_ALREADY_IN_GROUP" | "USER_OR_GROUP_NOT_FOUND" | "INTERNAL_ERROR"
type GetUserListByGroupIdCode = "GROUP_NOT_FOUND" | "INTERNAL_ERROR"
type GetUserInGroupByKeyCode = "USER_NOT_IN_GROUP" | "INVALID_FIELD" | "INTERNAL_ERROR"
type GetGroupListByUserIdCode = "INVALID_FIELD" | "INTERNAL_ERROR"
type DeleteUserInGroupCode = "INTERNAL_ERROR"


interface CreateGroupInput {
    name: string,
}
interface CreateUserInGroupInput {
    userId : number,
    groupId : number,
    role : "member" | "host"
}
interface GetGroupByIdInput<F extends GroupFields[]> {
    id : number,
    field?: F
}
interface UpdateGroupByIdInput{
    id : number,
    name? : string,
    lastMessageId? : number,
    avatarFileId? : number | null
    createdAt? : Date
}
interface GetUserListByGroupIdInput{
    groupId : number
}
interface GetUserInGroupByKeyInput<F extends UserInGroupFields[]> {
    userId: number,
    groupId: number,
    field?: F
}
interface GetGroupListByUserIdInput<F extends GroupFields[]>{
    userId: number,
    fields: F
}
interface DeleteUserInGroupInput{
    memberId : number,
    groupId : number
}

interface MemberData{
    userId : number,
    role : "member" | "host",
}
interface CreateGroupResponseData {
    id : number
}
interface GetUserListByGroupIdData{
    members: MemberData[]
}
type GetGroupData<F extends GroupFields[]> = {
    [K in F[number]]: Group[K]
}
type GetUserInGroupData<F extends UserInGroupFields[]> = {
    [K in F[number]]: UserInGroup[K]
}
interface GetGroupListByUserIdData<F extends GroupFields[]>{
    groups: GetGroupData<F>[]
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
export async function getGroupById<F extends GroupFields[]>(
    input : GetGroupByIdInput<F>
) : Promise<RepoResult<GetGroupByIdCode, GetGroupData<F>>> {
    let success = false
    let code : GetGroupByIdCode | undefined = undefined
    let data : GetGroupData<F> | undefined = undefined
    let fields : string
    if(input.field == undefined)
        fields = "id, name, last_message_id as lastMessageId, created_at as createdAt"
    else
        fields = getGetField(input.field)
    
    const sql = `SELECT ${fields} FROM chat_group WHERE id = ?;`
    try {
        const [rows, packet] = await pool.query<RowDataPacket[]>(sql, input.id)
        success = true
        if(rows.length <= 0) {
            code = "GROUP_NOT_FOUND"
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
export async function updateGroupById(
    group: UpdateGroupByIdInput, 
    fields: GroupFields[] | undefined = undefined
) : Promise<RepoResult<UpdateGroupByIdCode>> {
    let code : UpdateGroupByIdCode
    let data: undefined = undefined
    const {field, values} = getUpdateField(group, fields)
    if(values.length == 0){
        return {code : "EMPTY_FIELD", success : false, data}
    }

    const sql = `UPDATE chat_group SET ${field} WHERE id = ?`
    
    try{
        const [result] = await pool.query<ResultSetHeader>(sql, [...values, group.id])
        if(result.affectedRows == 0){
            return {success : true, code : "GROUP_NOT_FOUND"}
        } 
        return {success : true}

    } catch(err){
        const e = err as any
        if(e?.code == "ER_PARSE_ERROR")
            code = "SYNTAX_ERROR"
        else if(e?.code == "ER_BAD_FIELD_ERROR")
            code = "INVALID_FIELD"
        else if(e?.code == "ER_NO_REFERENCED_ROW_2")
            code = "REFERENCE_ERROR"
        else 
            console.error(err)
            code = "INTERNAL_ERROR"
        return {success : false, code}
    }
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
            code = "USER_OR_GROUP_NOT_FOUND"
        } else {
            code = "INTERNAL_ERROR"
            console.log(err)
        }
    } 
    connection.release()
    return {code, success, data}
}
export async function getUserListByGroupId(
    input: GetUserListByGroupIdInput
) : Promise<RepoResult<GetUserListByGroupIdCode, GetUserListByGroupIdData>> {
    const sql = `SELECT user_id as userId, role FROM user_in_group WHERE group_id = ?;`
    try {
        const [rows, packet] = await pool.query<RowDataPacket[]>(sql, [input.groupId])
        if(rows.length <= 0){
            return {success : false, code : "GROUP_NOT_FOUND"}
        }
        const members = rows as MemberData[]
        return {success: true, data : {members}}
    } catch (err){
        let code: GetUserListByGroupIdCode
        code = "INTERNAL_ERROR"
        const e = err as any
        return {success : false, code}
    }
}
export async function getUserInGroupByKey<F extends UserInGroupFields[]>(
    input : GetUserInGroupByKeyInput<F>
) : Promise<RepoResult<GetUserInGroupByKeyCode, GetUserInGroupData<F>>>  {
    let success = false
    let code : GetUserInGroupByKeyCode | undefined = undefined
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
export async function getGroupListByUserId<F extends GroupFields[]>(
    input : GetGroupListByUserIdInput<F>
) : Promise<RepoResult<GetGroupListByUserIdCode, GetGroupListByUserIdData<F>>>  {
    let success = false
    let code : GetGroupListByUserIdCode | undefined = undefined
    
    const fields = getGetField(input.fields, "chat_group")    

    const sql = `
        SELECT ${fields} FROM user_in_group
        LEFT JOIN chat_group  ON user_in_group.group_id = chat_group.id
        WHERE user_in_group.user_id = ?;
    `
    try {
        const [rows, packet] = await pool.query<RowDataPacket[]>(sql, [input.userId])
        return {success : true, data : {groups : rows} as GetGroupListByUserIdData<F>}
    } catch (err){
        const e = err as any
        if(e.code == 'ER_BAD_FIELD_ERROR')
            code = "INVALID_FIELD"
        else{
            code = "INTERNAL_ERROR"
            console.log(err)
        }
    }
    return {success, code}
}
export async function deleteUserInGroupByKey(
    input : DeleteUserInGroupInput
) : Promise<RepoResult<DeleteUserInGroupCode>> {
    const sql = `DELETE FROM user_in_group WHERE user_id = ? AND group_id = ?`
    try{
        await pool.query<ResultSetHeader>(sql, [input.memberId, input.groupId])
        return {success : true}
    } catch(err) {
        const e = err as any
        console.log(e)
        return {success : false, code : "INTERNAL_ERROR"}
    }
}
