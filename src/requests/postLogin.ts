import { NextFunction, Request, Response } from 'express';
import { config } from 'dotenv';
import { login, UnauthorizedError } from '../common/login';

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
