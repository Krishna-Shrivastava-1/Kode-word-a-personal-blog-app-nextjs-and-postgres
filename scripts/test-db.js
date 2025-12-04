import 'dotenv/config'
import pool from "../lib/db.js";

async function testConnection() {
    try {
        
        const result = await pool.query('Select NOW() as time , version() as version');
        console.log("Database Connected");
        console.log("Time ", result.rows[0].time);
        console.log("Version ", result.rows[0].version);
        process.exit(0);
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}
testConnection()