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
            const pool = new Pool(params);
            db = { params, pool };
        }
        return db.pool;
    } catch (e) {
        console.error('stoped: ', e);
        throw new Error('something went wrong');
    }
}

export type ParamType = string | Number | boolean | null;
export type GenerycParams = Record<string, ParamType>;

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

export async function queryOne<T>(
    sql: string,
    params: ParamType[] = []
): Promise<T> {
    const response = await query<T>(sql, params);
    return response.pop() as T;
}

function prepare(params: GenerycParams) {
    const names: string[] = [];
    const values: ParamType[] = [];
    const update: string[] = [];

    const keys = Object.keys(params);
    for (let i = 0; i < keys.length; i++) {
        const name = keys[i];
        names.push(name);
        values.push(params[name]);
        update.push(`${name} = $${i + 1}`);
    }
    const tmp = ((n: number) => {
        let m: string[] = [];
        for (let i = 1; i <= n; i++) {
            m.push(`$${i}`);
        }
        return m.join(', ');
    })(names.length);
    return { names, values, update, tmp };
}

export async function insert(
    table: string,
    params: GenerycParams
): Promise<Number> {
    const { names, values, tmp } = prepare(params);
    const sql =
        `INSERT INTO ${table}(${names.join(', ')}) VALUES(${tmp})` +
        ` RETURNING id;`;
    let outsideResolve: any;
    const promise: Promise<number> = new Promise((resolve) => {
        outsideResolve = resolve;
    });
    getPool().query(sql, values, (err: any, result: any) => {
        if (err) {
            console.error(err);
            throw new Error(`Can't create new Item`);
        } else {
            outsideResolve(result.rows[0].id);
        }
    });
    return promise;
}
