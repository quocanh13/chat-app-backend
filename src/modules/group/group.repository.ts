import { ResultSetHeader } from "mysql2";
import pool from "../../configs/database.js";
import { getInsertField } from "../../utils/sql.js";
import { RepoResponse } from "../../shared/types.js";


interface CreateGroupInput {
    name: string,
    type: "direct" | "group"
}
interface CreateGroupData {
    id : number
}
type CreateGroupCode = "NAME_TOO_LONG" | "INVALID_GROUP_TYPE" | "INTERNAL_ERROR"
export async function createGroup(group: CreateGroupInput) : Promise<RepoResponse<CreateGroupCode, CreateGroupData>>{
    let success = false
    let code : CreateGroupCode | undefined = undefined
    let data : CreateGroupData | undefined = undefined

    const {field, values, placeholder} = getInsertField(group)
    const sql = `INSERT INTO Group(${field}) VALUES (${placeholder});`
    try{
        const res = await pool.query<ResultSetHeader>(sql, values)
        success = true
        data = {id : res[0].insertId}
    } catch(err){
        const e = err as any
        if(e.code == "ER_DATA_TOO_LONG"){
            code = "NAME_TOO_LONG"
        } else if(e.code == "WARN_DATA_TRUNCATED"){
            code = "INVALID_GROUP_TYPE"
        } else {
            code = "INTERNAL_ERROR"
            console.log(err)
        }
    } 
    return {code, success, data}
}

