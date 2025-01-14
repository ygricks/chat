import { UseGeneralTemplate } from '../common';
import { Request, Response } from 'express';

export async function pageMain(request: Request, response: Response) {
    const data = await UseGeneralTemplate({
        body: '<ul id="rooms_list"></ul>',
        head: '<script src="/rooms.js"></script>',
        title: 'chat- rooms'
    });

    return response.status(200).set('Content-Type', 'text/html').send(data);
}
