import {ResultSetHeader, RowDataPacket} from "mysql2"
import pool from "../../configs/database.js";
import { getGetField, getInsertField, getUpdateField } from "../../utils/sql.js";
import { RepoResult, User, UserFields, FileFields, File } from "../../shared/types.js";

type CreateUserCode = "DUPLICATE_ENTRY" | "INTERNAL_ERROR" | "OK";
type GetUserByIdCode = "USER_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN" | "OK";
type GetUserByUsernameCode = "USER_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN" | "OK";
type UpdateUserCode = "USER_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN" | "EMPTY_FIELD" | "REFERENCE_ERROR" | "OK"; 

interface CreateUserInput{
    username: string,
    passwordHash: string,
    name: string,
}
interface UpdateUserInput{
    id: number
    username?: string,
    passwordHash?: string,
    email?: string,
    name?: string,
    avatarFileId?: number | null
}

type GetUserResult<F extends UserFields[]> = {
    [K in F[number]]: User[K]
}

export async function createUser(
    user: CreateUserInput, 
    fields: UserFields[] | undefined = undefined
) : Promise<RepoResult<CreateUserCode, undefined>>{
    let success = false, code: CreateUserCode = "OK", data = undefined

    const {field, placeholder, values} = getInsertField(user, fields)
    const sql = `INSERT INTO USER (${field}) VALUES (${placeholder})`
    
    try{
        const res = await pool.query(sql, values)
        success = true
    } catch(err){
        const e = err as any
        if(e?.code == "ER_DUP_ENTRY") {
            code = "DUPLICATE_ENTRY"
        } else {
            console.error(err)
            code = "INTERNAL_ERROR"
        }
    }

    return {success, code, data}
}
export async function getUserById <F extends UserFields[] >(
    id: number, 
    fields: F
) : Promise<RepoResult<GetUserByIdCode, GetUserResult<F> | undefined>> {

    let success = false
    let code: GetUserByIdCode = "OK"
    let data: GetUserResult<F> | undefined = undefined

    const fields_str = getGetField(fields)

    const sql = `SELECT ${fields_str} FROM user WHERE id = ?;`
    
    try{
        const [rows, fields] = await pool.query<RowDataPacket[]>(sql, [id])
        if(rows.length == 0) {
            code = "USER_NOT_FOUND"
        } else {
            success = true
            data = rows[0] as GetUserResult<F>
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
    username: string, 
    fields: F
) : Promise<RepoResult<GetUserByUsernameCode, GetUserResult<F> | undefined>> {

    let success = false
    let code: GetUserByUsernameCode = "OK"
    let data: GetUserResult<F> | undefined = undefined

    const fields_str = getGetField(fields)

    const sql = `SELECT ${fields_str} FROM user WHERE username = ?;`
    
    try{
        const [rows, fields] = await pool.query<RowDataPacket[]>(sql, [username])
        if(rows.length == 0) {
            code = "USER_NOT_FOUND"
        } else {
            success = true
            data = rows[0] as GetUserResult<F>
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



