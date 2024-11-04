import { Request, Response } from 'express';
import { createRef, getRef } from '.';
import { call404, checkRegisterData, Register } from '../common';
import { IRegisterUser } from '../interfaces';

export async function postRefReq(request: Request, response: Response) {
    const result = await createRef(request.body.user.id);

    return response.json({ ref: result });
}

export async function checkRegisterDataReq(
    request: Request,
    response: Response
) {
    const user: IRegisterUser = {
        name: request.body?.name,
        password: request.body?.password
    };
    const refName = String(request.params.ref_name);
    const ref = await getRef(refName);

    if (!ref?.id) {
        const html = await call404();
        return response.status(404).send(html);
    } else {
        const check = await checkRegisterData(user);
        return response.json(check);
    }
}

export async function registerReq(request: Request, response: Response) {
    const user: IRegisterUser = {
        name: request.body?.name,
        password: request.body?.password
    };
    const refName = String(request.params.ref_name);
    const ref = await getRef(refName);

    if (!ref?.id) {
        const html = await call404();
        return response.status(404).send(html);
    } else {
        const register = await Register(refName, user);
        return response.json(register);
    }
}
