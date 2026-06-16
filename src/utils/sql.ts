import { PoolConnection } from "mysql2/promise";
import pool from "../configs/database.js";

type TransactionResult<Code = undefined, Data = undefined> = {
    success : boolean,
    code?: "INTERNAL_ERROR" | Code,
    data?: Data
}

export async function queryTransaction<Code = undefined, Data = undefined>(
    callback: (connection: PoolConnection) => Promise<TransactionResult<Code, Data>>
) : Promise<TransactionResult<Code, Data>> {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const result = await callback(connection);

        if (result.success) {
            await connection.commit();
        } else {
            await connection.rollback();
        }

        return result;
    } catch(err) {
        console.log(err)
        await connection.rollback();
        return {success : false, code : "INTERNAL_ERROR"}
    } finally {
        connection.release();
    }
}

export function snakeToCamel(s: string) : string{
    return s.replace(/_([a-z0-9])/g, (_, c)=>{
        return c.toUpperCase();
    })
}

export function camelToSnake(s: string) : string{
    return s.replace(/[A-Z]/g, (c)=>{
        return `_${c.toLowerCase()}`
    })
}

export function getInsertField(
    data: Record<string, any>,
    keys: string[] | undefined = undefined
) {
    const fields: string[] = [];
    const placeholders: string[] = [];
    const values: any[] = [];

    keys ??= Object.keys(data); 
    for (const key of keys) {
        const value = data[key];
        
        if (value != null) {
            fields.push(camelToSnake(key));
            placeholders.push("?");
            values.push(value);
        }
    }

    return {
        field: fields.join(", "),
        placeholder: placeholders.join(", "),
        values
    };
}

export function getGetField(fields: string[]) : string{
    fields = fields.map((v, i) => {
        return `${camelToSnake(v)} as ${v}`
    })
    return fields.join(", ")
}

export function getUpdateField(
    data: Record<string, any>,
    keys: string[] | undefined = undefined
) {
    const fields: string[] = [];
    const values: any[] = [];

    keys ??= Object.keys(data); 
    for (const key of keys) {
        const value = data[key];
        if (value != null) {
            fields.push(`${camelToSnake(key)} = ?`);
            values.push(value);
        }
    }

    return {
        field: fields.join(", "),
        values
    };
}