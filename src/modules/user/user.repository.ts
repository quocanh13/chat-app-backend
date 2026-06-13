import {ResultSetHeader, RowDataPacket} from "mysql2"
import pool from "../../configs/database.js";
import { getGetField, getInsertField, getUpdateField } from "../../utils/sql.js";
import { RepoResponse, User, UserFields, FileFields, File } from "../../shared/types.js";

type GetUserByIdCode = "USER_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN" | "OK";
type GetFileByIdCode = "FILE_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN" | "OK";
type UpdateUserCode = "USER_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN" | "EMPTY_FIELD" | "REFERENCE_ERROR" | "OK"; 

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
type GetFileResult<F extends FileFields[]> = {
    [K in F[number]]: File[K]
}
export async function getUserById <F extends UserFields[] >(
    id: number, 
    fields: F
) : Promise<RepoResponse<GetUserByIdCode, GetUserResult<F> | undefined>> {

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

export async function updateUser(
    user: UpdateUserInput, 
    fields: UserFields[] | undefined = undefined
) : Promise<RepoResponse<UpdateUserCode>> {

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

export async function getFileById <F extends FileFields[]>(
    id: number,
    fields : F
): Promise<RepoResponse<GetFileByIdCode, GetFileResult<F> | undefined>> {
    let success = false
    let code: GetFileByIdCode = "OK"
    let data: GetFileResult<F> | undefined = undefined

    const fields_str = getGetField(fields)

    const sql = `SELECT ${fields_str} FROM file WHERE id = ?;`
    
    try{
        const [rows, fields] = await pool.query<RowDataPacket[]>(sql, [id])
        if(rows.length == 0) {
            code = "FILE_NOT_FOUND"
        } else {
            success = true
            data = rows[0] as GetFileResult<F>
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