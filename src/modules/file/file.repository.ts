import {ResultSetHeader, RowDataPacket} from "mysql2"
import pool from "../../configs/database.js";
import { getGetField, getInsertField, getUpdateField } from "../../utils/sql.js";
import { RepoResult, User, UserFields, FileFields, File } from "../../shared/types.js";

type CreateFileCode = "INTERNAL_ERROR" | "FILE_NAME_TOO_LONG" | "SYNTAX_ERROR" | "INVALID_TYPE" | "INVALID_FIELD";
type GetFileByIdCode = "FILE_NOT_FOUND" | "INTERNAL_ERROR" | "SYNTAX_ERROR" | "INVALID_COLUMN";

interface GetFileByIdInput<F>{
    fileId : number,
    fields : F
}
interface CreateFileInput {
    name: string,
    mimeType: string,
    type: "USER_AVATAR" | "GROUP_AVATAR" | "MESSAGE",
    size: number,
    userId: number
}

interface CreateFileData {
    id : number
}
type GetFileData<F extends FileFields[]> = {
    [K in F[number]]: File[K]
}

export async function createFile(
    input : CreateFileInput
) : Promise<RepoResult<CreateFileCode, CreateFileData>> {
    const {field, placeholder, values} = getInsertField(input)
    const sql = `INSERT INTO file (${field}) VALUES (${placeholder});`
    try {
        const res = await pool.query<ResultSetHeader>(sql, values)
        const data = {id : res[0].insertId}
        return {success : true, data}
    } catch (err) {
        const e = err as any
        let code : CreateFileCode = "INTERNAL_ERROR"
        if(e.code == "ER_DATA_TOO_LONG")
            code = "FILE_NAME_TOO_LONG"
        else if(e.code == "WARN_DATA_TRUNCATED")
            code = "INVALID_TYPE"
        else if(e.code == "SYNTAX_ERROR")
            code = "SYNTAX_ERROR"
        else if(e.code == "ER_BAD_FIELD_ERROR")
            code = "INVALID_FIELD"
        else {
            code = "INTERNAL_ERROR"
            console.log(err)
        }
        return {success : false, code}
    }
}

export async function getFileById <F extends FileFields[]>(
    input : GetFileByIdInput<F>
): Promise<RepoResult<GetFileByIdCode, GetFileData<F> | undefined>> {
    let success = false
    let code: GetFileByIdCode | undefined = undefined
    let data: GetFileData<F> | undefined = undefined

    const fields_str = getGetField(input.fields)

    const sql = `SELECT ${fields_str} FROM file WHERE id = ?;`
    
    try{
        const [rows, fields] = await pool.query<RowDataPacket[]>(sql, [input.fileId])
        if(rows.length == 0) {
            code = "FILE_NOT_FOUND"
        } else {
            success = true
            data = rows[0] as GetFileData<F>
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