import { Pool } from "pg";
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    host: '143.198.247.195',         
    port: 5432,                   
    user: 'hart89809',               
    password: '824589809',       
    database: 'hart89809',          
    ssl: false                       
});

let db = null;

if (process.env.NODE_ENV == ('development') && process.env.DISABLE_SQL_LOGGING !== 'true') {

    db = {
        async query(text, params) {
            try {
                const start = Date.now();
                const res = await pool.query(text, params);
                const duration = Date.now() - start;
                console.log('Executed query:', { 
                    text: text.replace(/\s+/g, ' ').trim(), 
                    duration: `${duration}ms`, 
                    rows: res.rowCount 
                });
                return res;
            } catch (error) {
                console.error('Error in query:', { 
                    text: text.replace(/\s+/g, ' ').trim(), 
                    error: error.message 
                });
                throw error;
            }
        },

        async close() {
            await pool.end();
        }
    };
} else {
    db = pool;
}

export default db;