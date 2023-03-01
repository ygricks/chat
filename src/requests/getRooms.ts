import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function getRooms(
    request: Request,
    response: Response
): Promise<Response> {
    const result = readFileSync(
        join(__dirname, '../../public/rooms.html'),
        'utf-8'
    );
    return response.send(result);
}
