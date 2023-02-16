import { Request, Response } from 'express';
import { query } from '../common';

export async function getRoomMassages(
    request: Request,
    response: Response
): Promise<Response> {
    const {
        query: { id }
    } = request;
    const data = await query('SELECT * FROM mess LIMIT 40');
    return response.json(data);
}
