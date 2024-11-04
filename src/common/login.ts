import { NextFunction, Request, Response } from 'express';
import { compareSync, hashSync } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { config } from 'dotenv';

import { insert, query, queryOne, remove } from './db';
import { IRegisterUser, IResult, IUser } from '../interfaces';

config();

export async function postLogin(
    request: Request,
    response: Response,
    next: NextFunction
): Promise<Response> {
    const logged = await login(request, response);
    if (!logged) {
        return UnauthorizedError(response, { done: false });
    }
    return response.status(200).json({
        done: true
    });
}

export class Cookies {
    constructor(private request: Request, private response: Response) {}
    set(name: string, value: string): void {
        this.response.cookie(name, value, { httpOnly: true });
    }
    get(name: string): string | undefined {
        try {
            return this.request.cookies[name];
        } catch (_) {
            return undefined;
        }
    }
}

export async function login(
    request: Request,
    response: Response
): Promise<boolean> {
    const {
        body: { username, password }
    } = request;
    const user = await queryOne<IUser>(`SELECT * FROM users WHERE name=$1;`, [
        username
    ]);
    if (!user || !compareSync(password, user.password)) {
        return Promise.resolve(false);
    }
    const secret = String(process.env.HASH);
    const publicUser = Object.assign({}, user) as Partial<IUser>;
    delete publicUser.password;
    const jwtToken = sign(publicUser, secret, {
        // expired in seconds ( 86400 = 24H )
        expiresIn: 86400 * 7
    });
    const cookies = new Cookies(request, response);
    cookies.set('TOKEN', jwtToken);
    return Promise.resolve(true);
}

export function isAuthorized(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const cookies = new Cookies(request, response);
    const jwtToken = String(cookies.get('TOKEN'));
    const secret = String(process.env.HASH);
    verify(jwtToken, secret, (err, publicUser) => {
        if (err) {
            response.redirect('/login');
            return next(new Error('Access Denied'));
        }
        request.body.user = publicUser;
        next();
    });
}

export async function UnauthorizedError(
    response: Response,
    data: object = {}
): Promise<Response> {
    return new Promise((resolve) =>
        setTimeout(
            resolve,
            500 + Math.random() * 500,
            response.status(401).json(data)
        )
    );
}

export async function checkRegisterData(user: IRegisterUser): Promise<IResult> {
    const reg = new RegExp(/[a-z,A-Z,0-9]+/g);
    const login = user.name.match(reg)?.join('');

    const valid = login === user.name && login.length >= 3 && login.length < 10;
    if (!valid) {
        return Promise.resolve({
            done: false,
            info: 'invalid name, 3 >= length <= 10, only letters and digits'
        });
    }
    const userExist = await query<{ id: number }[]>(
        'SELECT id FROM users WHERE name=$1',
        [login]
    );
    if (userExist.length) {
        return Promise.resolve({
            done: false,
            info: 'user with that name already exists'
        });
    }
    if (user.password.length < 6 || user.password.length > 20) {
        return Promise.resolve({
            done: false,
            info: 'invalid password, 6 >= length <= 20'
        });
    }
    return Promise.resolve({ done: true, info: 'ok' });
}

export async function Register(
    refName: string,
    user: IRegisterUser
): Promise<IResult> {
    const check = await checkRegisterData(user);
    if (!check.done) {
        return check;
    }
    const hashPass = hashSync(user.password, 10);
    const userId = insert('users', { name: user.name, password: hashPass });
    if (!userId) {
        return { done: false, info: 'error on creating a new user' };
    }
    await remove('refs', { ref: refName });

    return { done: true, info: 'ok' };
}
