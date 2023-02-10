import { Pool, PoolConfig, QueryResult } from 'pg';
import { config } from 'dotenv';

config();

interface DB {
    pool: Pool;
    params: PoolConfig;
}

function getConnectionParams(): PoolConfig {
    return {
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT),
        max: Number(process.env.DB_MAX_POOLS)
    };
}

let db: DB;

function getPool(): Pool {
    try {
        if (!db) {
            const params = getConnectionParams();
            console.log({params});
            const pool = new Pool(params);
            db = {params, pool};
        }
        return db.pool;
    } catch (e) {
        console.error('stoped: ', e)
        throw new Error('something went wrong');
    }
}

export type ParamType = string | Number | boolean | null;

export async function query<Type>(
    sql: string,
    params: ParamType[] = []
): Promise<Type[]> {
    try {
        const response = await getPool().query(sql, params);
        return response.rows as Type[];
    } catch (error) {
        const message = `Error SQL calling [${sql}]`;
        console.error(message, error);
        throw error;
    }
}
