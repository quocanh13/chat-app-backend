import { PoolConnection } from "mysql2/promise";
import pool from "./database.js";

export async function queryTransaction<T>(
    callback: (connection : PoolConnection)=>T
) : Promise<T> {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const result = await callback(conn);

        await conn.commit();

        return result;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}
