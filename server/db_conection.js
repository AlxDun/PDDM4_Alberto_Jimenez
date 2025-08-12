import mysql from "mysql2/promise"

export const pool = mysql.createPool({
    host: "localhost",
    database: "pd_alberto_jimenez_tayrona",
    port: "3306",
    user: "root",
    password: "root",
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
})

async function probarConexion() {
    try {
        const connection = await pool.getConnection()
        console.log("Correct connection.")
        connection.release();
    }
    catch (error) {
        console.error("Connection error.", error.message);
    }
}

probarConexion()