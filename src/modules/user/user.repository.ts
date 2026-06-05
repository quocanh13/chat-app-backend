import {} from "mysql2"
import pool from "../../configs/database.js";
import { getInsertField } from "../../utils/sql.js";
import { RepoResponse } from "../../shared/types.js";

interface CreateUser{
    username: string,
    password_hash: string,
    name: string,
}

type CreateUserCode = "DUPLICATE_ENTRY" | "INTERNAL_ERROR";

export async function create(user: CreateUser) : Promise<RepoResponse<CreateUserCode | undefined, undefined>>{
    let success = true, code: CreateUserCode | undefined, data = undefined

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