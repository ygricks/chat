import { NextFunction, Request, Response } from 'express';
import { config } from 'dotenv';
import { login } from '../common/login';
import { ICookies } from '../interfaces';

config();

export async function postLogin(
    request: Request,
    response: Response,
    next: NextFunction
): Promise<Response> {
    const {
        body: { username, password }
    } = request;

    const cookies: ICookies = {
        req: request,
        res: response,
        set: (name: string, value: string) => {
            response.cookie(name, value, { httpOnly: true });
        },
        get: (name: string): string | undefined => {
            try {
                return request.cookies[name];
            } catch (_) {
                return undefined;
            }
        }
    };

    const logged = await login(cookies, username, password);
    return response.status(200).json({
        done: logged
    });
}
