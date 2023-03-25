import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '../common';

export async function getRoom(
    request: Request,
    response: Response
): Promise<Response> {
    const result = readFileSync(
        join(__dirname, '../../public/room.html'),
        'utf-8'
    );
    return response.send(result);
}
export async function getRoomsPage(
    request: Request,
    response: Response
): Promise<Response> {
    const result = readFileSync(
        join(__dirname, '../../public/rooms.html'),
        'utf-8'
    );
    return response.send(result);
}

export async function rooms(
    request: Request,
    response: Response
): Promise<Response> {
    const data = await query('SELECT * FROM rooms LIMIT 40');
    return response.json(data);
}
