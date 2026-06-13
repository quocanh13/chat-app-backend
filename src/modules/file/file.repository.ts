import {ResultSetHeader, RowDataPacket} from "mysql2"
import pool from "../../configs/database.js";
import { getGetField, getInsertField, getUpdateField } from "../../utils/sql.js";
import { RepoResult, User, UserFields, FileFields, File } from "../../shared/types.js";


type GetFileByIdCode = "FILE_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN" | "OK";

type GetFileResult<F extends FileFields[]> = {
    [K in F[number]]: File[K]
}

export async function getFileById <F extends FileFields[]>(
    id: number,
    fields : F
): Promise<RepoResult<GetFileByIdCode, GetFileResult<F> | undefined>> {
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