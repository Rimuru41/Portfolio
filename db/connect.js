//Connections
import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_INTERNAL_PORT || 5432,
    ssl: process.env.POSTGRES_HOST !== 'db' ? { rejectUnauthorized: false } : false,
})

pool.on('connect', () => {
    console.log('Successfully connected to the database');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

export default pool;