import {RowDataPacket} from "mysql2"
import pool from "../../configs/database.js";
import { getGetField, getInsertField } from "../../utils/sql.js";
import { RepoResponse } from "../../shared/types.js";

type CreateUserCode = "DUPLICATE_ENTRY" | "INTERNAL_ERROR" | "OK";

interface CreateUserInput{
    username: string,
    password_hash: string,
    name: string,
}

type GetUserByIdCode = "USER_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN" | "OK";
type UserFields = "username" | "passwordHash" | "name" | "email" | "avatarFileId"

interface User{
    id: number
    username: string,
    passwordHash: string,
    email: string,
    name: string,
    avatarFileId: number
}

type GetUserResult<F extends UserFields[]> = {
    [K in F[number]]: User[K]
}

export async function create(user: CreateUserInput) : Promise<RepoResponse<CreateUserCode, undefined>>{
    let success = true, code: CreateUserCode = "OK", data = undefined

    const {field, placeholder, values} = getInsertField(user, ["username", "password_hash", "name"])
    const sql = `INSERT INTO USER (${field}) VALUES (${placeholder})`
    
    try{
        const res = await pool.query(sql, values)
    } catch(err){
        console.error(err)
        success = false
        const e = err as any
        if(e?.code == "ER_DUP_ENTRY") {
            code = "DUPLICATE_ENTRY"
        } else {
            code = "INTERNAL_ERROR"
        }
    }

    return {success, code, data}
}

export async function getUserById <F extends UserFields[] >(
    id: number, 
    fields: F
) : Promise<RepoResponse<GetUserByIdCode, GetUserResult<F> | undefined>> {

    let success = true
    let code: GetUserByIdCode = "OK"
    let data: GetUserResult<F> | undefined = undefined

    const fields_str = getGetField(fields)

    const sql = `SELECT ${fields_str} FROM user WHERE id = ?;`
    
    try{
        const [rows, fields] = await pool.query<RowDataPacket[]>(sql, [id])
        if(rows.length == 0) {
            success = false
            code = "USER_NOT_FOUND"
        } else {
            data = rows[0] as GetUserResult<F>
        }
    } catch(err){
        console.error(err)
        success = false
        const e = err as any

        if(e?.code == "ER_PARSE_ERROR")
            code = "SYNTAX_ERROR"
        else if(e?.code == "ER_BAD_FIELD_ERROR")
            code = "INVALID_COLUMN"
        else 
            code = "INTERNAL_ERROR"
        
    }
    
    return {success, code, data} 
}