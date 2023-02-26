import { Request, Response } from 'express';

export interface ICookies {
    req: Request;
    res: Response;
    set: (name: string, value: string) => void;
    get: (name: string) => string | undefined;
}
