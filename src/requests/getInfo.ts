import { Request, Response } from 'express';

export async function getInfo(
    request: Request,
    response: Response
): Promise<Response> {
    const message: string = 'More information about application, <a href="/room/1" style="color:white">room</a>';
    return response.send(
        `<html style="background: darkslategrey; color: lightblue;">${message}</html>`
    );
}
