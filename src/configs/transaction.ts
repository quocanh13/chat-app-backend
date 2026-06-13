import { PoolConnection } from "mysql2/promise";
import pool from "./database.js";

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

