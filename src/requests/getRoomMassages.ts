import { Request, Response } from 'express';
import { query } from '../common';

export async function getRoomMassages(
    request: Request,
    response: Response
): Promise<Response> {
    const {
        query: { id }
    } = request;
    const data = await query(
        'SELECT mt.id, mt.created_at, mt.mess, ut.name, mt.created_by=$1 AS author FROM mess AS mt LEFT JOIN users AS ut ON ut.id=mt.created_by ORDER BY mt.id LIMIT 40',
        [request.body.user.id]
    );
    return response.json(data);
}
