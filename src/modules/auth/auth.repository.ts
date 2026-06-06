import pool from "../../configs/database.js";
import { getInsertField } from "../../utils/sql.js";
import { RepoResponse } from "../../shared/types.js";

type CreateUserCode = "DUPLICATE_ENTRY" | "INTERNAL_ERROR" | "OK";

interface CreateUserInput{
    username: string,
    password_hash: string,
    name: string,
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