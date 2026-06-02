import mysql from "mysql2/promise"
import dotenv from "dotenv"
dotenv.config()

const host = process.env.DB_HOST || "127.0.0.1"
const port = Number(process.env.DB_PORT) || 3306
const user = process.env.DB_USER || "root"
const password = process.env.DB_PASSWORD

const pool = mysql.createPool({
    host, port, user, password,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

try{
    const connections = await pool.getConnection()
    console.log("Connected to database")
} catch (err){
    console.error(err)
}



export default pool 