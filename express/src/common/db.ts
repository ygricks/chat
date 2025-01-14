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
type Settings = { noId: boolean; raw: boolean };

export async function query<Type>(
    sql: string,
    params: ParamType[] = [],
    settings: Partial<Settings> = {}
): Promise<Type> {
    try {
        const response = await getPool().query(sql, params);
        return Promise.resolve(
            settings?.raw ? (response as Type) : (response.rows as Type)
        );
    } catch (error) {
        const message = `Error SQL calling [${sql}]`;
        console.error(message, error);
        throw error;
    }
}

export function qTemp(len: number, s: number = 1) {
    let res: string[] = [];
    for (let n = 0; n < len; n++) {
        res.push(`$${s + n}`);
    }
    return res.join(', ');
}

export async function queryOne<T>(
    sql: string,
    params: ParamType[] = []
): Promise<T> {
    const response = await query<T[]>(sql, params);
    return Promise.resolve(response.pop() as T);
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
    const tmp = qTemp(names.length);
    return { names, values, update, tmp };
}

function prepareMany(params: GenerycParams[]) {
    const names: string[] = [];
    const values: ParamType[] = [];
    const firstRecord: GenerycParams = params[0];
    const keys = Object.keys(firstRecord);
    for (let i = 0; i < keys.length; i++) {
        names.push(keys[i]);
    }
    for (const value of params) {
        for (const name of names) {
            values.push(value[name]);
        }
    }
    const tmp = ((n: number, d: number) => {
        const result: string[] = [];
        for (let e = 0; e < d; e++) {
            let m: string[] = [];
            for (let i = 1; i <= n; i++) {
                m.push(`$${i + e * n}`);
            }
            result.push('(' + m.join(', ') + ')');
        }
        return result.join(', ');
    })(names.length, params.length);
    return { names, values, tmp };
}

export async function insert(
    table: string,
    params: GenerycParams,
    settings: Partial<Settings> = {}
): Promise<Number> {
    const { names, values, tmp } = prepare(params);
    const sql =
        `INSERT INTO ${table}(${names.join(', ')}) VALUES(${tmp})` +
        (settings?.noId ? ';' : ` RETURNING id;`);
    let outsideResolve: any;
    const promise: Promise<number> = new Promise((resolve) => {
        outsideResolve = resolve;
    });
    getPool().query(sql, values, (err: any, result: any) => {
        if (err) {
            console.error(err);
            throw new Error(`Can't create new Item`);
        } else {
            outsideResolve(
                settings?.noId ? result.rowCount : result.rows[0].id
            );
        }
    });
    return promise;
}

export async function insertMany(
    table: string,
    params: GenerycParams[],
    settings: Partial<Settings> = {}
): Promise<any> {
    const { names, tmp, values } = prepareMany(params);
    const sql =
        `INSERT INTO ${table}(${names.join(', ')}) VALUES${tmp}` +
        (settings?.noId ? ';' : ` RETURNING id;`);
    let outsideResolve: any;
    const promise: Promise<any> = new Promise((resolve) => {
        outsideResolve = resolve;
    });
    getPool().query(sql, values, (err: any, result: any) => {
        if (err) {
            console.error(err);
            throw new Error(`Can't create new Item`);
        } else {
            outsideResolve(
                settings?.noId
                    ? result.rowCount
                    : result?.rows.map((o: { id: string }) => parseInt(o?.id))
            );
        }
    });
    return promise;
}

export async function update(
    table: string,
    params: GenerycParams,
    id: Number
): Promise<QueryResult<any>> {
    const { update, values } = prepare(params);
    values.push(id);
    const sql = `UPDATE ${table} SET ${update.join(', ')} WHERE id=$${
        values.length
    };`;
    return getPool().query(sql, values);
}

export async function remove(
    table: string,
    criteria: GenerycParams
): Promise<QueryResult<any>> {
    const { update, values } = prepare(criteria);
    const sql = `DELETE FROM ${table} WHERE ${update.join(' AND ')};`;
    return getPool().query(sql, values);
}
