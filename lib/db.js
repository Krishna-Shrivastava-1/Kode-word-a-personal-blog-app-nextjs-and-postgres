// import 'dotenv/config'
import { Pool } from "pg";

let pool;

if (!global.pgPool) {
    global.pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
    })
}

pool = global.pgPool;

export default pool;