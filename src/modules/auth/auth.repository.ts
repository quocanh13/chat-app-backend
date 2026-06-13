import { RowDataPacket } from "mysql2";
import pool from "../../configs/database.js";
import { getInsertField } from "../../utils/sql.js";
import { RepoResponse, UserFields, User } from "../../shared/types.js";
import { getGetField } from "../../utils/sql.js";

type CreateUserCode = "DUPLICATE_ENTRY" | "INTERNAL_ERROR" | "OK";
type GetUserByIdCode = "USER_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN" | "OK";
interface CreateUserInput{
    username: string,
    passwordHash: string,
    name: string,
}

export async function createUser(
    user: CreateUserInput, 
    fields: UserFields[] | undefined = undefined
) : Promise<RepoResponse<CreateUserCode, undefined>>{
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

type GetUserResult<F extends UserFields[]> = {
    [K in F[number]]: User[K]
}

export async function getUserByUsername <F extends UserFields[] >(
    username: string, 
    fields: F
) : Promise<RepoResponse<GetUserByIdCode, GetUserResult<F> | undefined>> {

    let success = false
    let code: GetUserByIdCode = "OK"
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

