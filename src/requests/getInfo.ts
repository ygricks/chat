import { Request, Response, RequestHandler } from 'express';

export async function getInfo(
    request: Request,
    response: Response
): Promise<Response> {
    // return response.status(200).json({ message: 'all good' });
    const message: string = 'More information about application';
    return response.send(
        `<html style="background: darkslategrey; color: lightblue;">${message}</html>`
    );
}
