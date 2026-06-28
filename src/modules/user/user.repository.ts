import {ResultSetHeader, RowDataPacket} from "mysql2"
import pool from "../../configs/database.js";
import { getGetField, getInsertField, getUpdateField } from "../../utils/sql.js";
import { RepoResult, User, UserFields} from "../../shared/types.js";

type CreateUserCode = "DUPLICATE_ENTRY" | "INTERNAL_ERROR" | "OK";
type GetUserByIdCode = "USER_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN" | "OK";
type GetUserByUsernameCode = "USER_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN" | "OK";
type UpdateUserCode = "USER_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN" | "EMPTY_FIELD" | "REFERENCE_ERROR" | "OK"; 

interface CreateUserInput{
    user : {
        username: string,
        passwordHash: string,
        name: string,
    }
    fields?: UserFields[]
}
interface GetUserByIdInput<F extends UserFields[]>{
    id : number,
    fields : F
}
interface GetUserByUsernameInput<F extends UserFields[]>{
    username : string,
    fields : F
}
interface UpdateUserInput{
    id: number
    username?: string,
    passwordHash?: string,
    email?: string,
    name?: string,
    avatarFileId?: number | null
}

interface CreateUserData{
    id : number
}
type GetUserData<F extends UserFields[]> = {
    [K in F[number]]: User[K]
}

export async function createUser(
    input: CreateUserInput
) : Promise<RepoResult<CreateUserCode, CreateUserData>>{
    let code: CreateUserCode = "OK"
    let data: CreateUserData

    const {field, placeholder, values} = getInsertField(input.user, input.fields)
    const sql = `INSERT INTO USER (${field}) VALUES (${placeholder})`
    
    try{
        const res = await pool.query<ResultSetHeader>(sql, values)
        data = {id : res[0].insertId}
        return {success : true, data}
    } catch(err){
        const e = err as any
        if(e?.code == "ER_DUP_ENTRY") {
            code = "DUPLICATE_ENTRY"
        } else {
            console.error(err)
            code = "INTERNAL_ERROR"
        }
        return {success : false, code}
    }
}
export async function getUserById <F extends UserFields[] >(
    input : GetUserByIdInput<F>
) : Promise<RepoResult<GetUserByIdCode, GetUserData<F> | undefined>> {

    let success = false
    let code: GetUserByIdCode = "OK"
    let data: GetUserData<F> | undefined = undefined

    const fields_str = getGetField(input.fields)

    const sql = `SELECT ${fields_str} FROM user WHERE id = ?;`
    
    try{
        const [rows, fields] = await pool.query<RowDataPacket[]>(sql, [input.id])
        if(rows.length == 0) {
            code = "USER_NOT_FOUND"
        } else {
            success = true
            data = rows[0] as GetUserData<F>
        }
    } catch(err){
        const e = err as any

        if(e?.code == "ER_PARSE_ERROR")
            code = "SYNTAX_ERROR"
        else if(e?.code == "ER_BAD_FIELD_ERROR")
            code = "INVALID_COLUMN"
        else 
            console.error(err)
            code = "INTERNAL_ERROR"
    }
    
    return {success, code, data} 
}
export async function updateUserById(
    user: UpdateUserInput, 
    fields: UserFields[] | undefined = undefined
) : Promise<RepoResult<UpdateUserCode>> {

    let success = false
    let code: UpdateUserCode = "OK"
    let data: undefined = undefined
    const {field, values} = getUpdateField(user, fields)
    if(values.length == 0){
        return {code : "EMPTY_FIELD", success : false, data}
    }

    const sql = `UPDATE user SET ${field} WHERE id = ?`
    
    try{
        const [result] = await pool.query<ResultSetHeader>(sql, [...values, user.id])
        if(result.affectedRows == 0){
            code = "USER_NOT_FOUND"
        } else {
            code = "OK"
            success = true
        }
    } catch(err){
        const e = err as any
        console.log(err)
        if(e?.code == "ER_PARSE_ERROR")
            code = "SYNTAX_ERROR"
        else if(e?.code == "ER_BAD_FIELD_ERROR")
            code = "INVALID_COLUMN"
        else if(e?.code == "ER_NO_REFERENCED_ROW_2")
            code = "REFERENCE_ERROR"
        else 
            console.error(err)
            code = "INTERNAL_ERROR"
    }
    return {success, code, data} 
}
export async function getUserByUsername <F extends UserFields[] >(
    input : GetUserByUsernameInput<F>
) : Promise<RepoResult<GetUserByUsernameCode, GetUserData<F> | undefined>> {

    let success = false
    let code: GetUserByUsernameCode = "OK"
    let data: GetUserData<F> | undefined = undefined

    const fields_str = getGetField(input.fields)

    const sql = `SELECT ${fields_str} FROM user WHERE username = ?;`
    
    try{
        const [rows, fields] = await pool.query<RowDataPacket[]>(sql, [input.username])
        if(rows.length == 0) {
            code = "USER_NOT_FOUND"
        } else {
            success = true
            data = rows[0] as GetUserData<F>
        }
    } catch(err){
        
        const e = err as any

        if(e?.code == "ER_PARSE_ERROR")
            code = "SYNTAX_ERROR"
        else if(e?.code == "ER_BAD_FIELD_ERROR")
            code = "INVALID_COLUMN"
        else {
            console.error(err)
            code = "INTERNAL_ERROR"
        }
    }
    
    return {success, code, data} 
}



