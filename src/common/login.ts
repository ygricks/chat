import { queryOne } from './db';
import { IUser } from '../interfaces';
import { NextFunction, Request, Response } from 'express';
import { compareSync } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';

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
        // expressed in seconds ( 86400 = 24H )
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
