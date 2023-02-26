import { insert, remove, queryOne } from './db';
import { Md5 } from 'ts-md5';
// import { getCookie, setCookie, removeCookie } from 'typescript-cookie'
import { ICookies } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';
import { IUser, ISession } from '../interfaces';

export async function login(
    cookies: ICookies,
    name: string,
    password: string
): Promise<boolean> {
    const pass = Md5.hashStr(Md5.hashStr(password) + process.env.HASH);

    const user = await queryOne<IUser>(
        `SELECT * FROM users WHERE name=$1 and password=$2`,
        [name, pass]
    );

    if (!user) {
        return Promise.resolve(false);
    }

    await remove('sessions', { user_id: user.id });

    const hash = uuidv4();
    await insert('sessions', { user_id: user.id, hash });

    cookies.set('SESSID', hash);

    return Promise.resolve(true);
}
