import { ResultSetHeader } from "mysql2";
import pool from "../../configs/database.js";
import { getInsertField } from "../../utils/sql.js";
import { ServiceResult } from "../../shared/types.js";

type CreateMessageCode = "INTERNAL_ERROR" | "INVALID_FIELD" | "REFERENCE_ERROR" | "DATA_TOO_LONG"

interface CreateMessageInput{
    userId: number,
    groupId: number,
    fileId?: number | null,
    content: string | null
}

interface CreateMessageData{
    id: number
}

export async function createMessage(
    input: CreateMessageInput
) : Promise<ServiceResult<CreateMessageCode, CreateMessageData>>{
    let success = false
    let code : CreateMessageCode | undefined = undefined

    const {field, values, placeholder} = getInsertField(input)
   
    const sql = `INSERT INTO message (${field}) VALUES (${placeholder});`
    try{
        const res = await pool.query<ResultSetHeader>(sql, values)
        return {success : true, data : {id: res[0].insertId}}
    } catch(err) {
        const e = err as any
        if(e.code == "ER_NO_REFERENCED_ROW_2")
            code = "REFERENCE_ERROR"
        else if(e.code == "ER_DATA_TOO_LONG")
            code = "DATA_TOO_LONG"
        else if(e.code == "ER_BAD_FIELD_ERROR")
            code = "INVALID_FIELD"
        else{
            console.log(err)
            code = "INTERNAL_ERROR"
        }
        return {success, code}
    }
}