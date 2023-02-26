import { Request, Response } from 'express';
import { insert, query, queryOne } from '../common';

export async function postMessage(
    request: Request,
    response: Response
): Promise<Response> {
    const {
        params: { id: roomId },
        body: { message }
    } = request;

    const userId = request.body.user.id;

    const data = {
        room_id: roomId,
        created_by: userId,
        mess: message
    };

    const id = await insert('mess', data);
    const mess = await queryOne(
        `SELECT mt.id, mt.created_at, mt.mess, ut.name, mt.created_by=$1 AS author FROM mess AS mt LEFT JOIN users AS ut ON ut.id=mt.created_by WHERE mt.id=$2`,
        [request.body.user.id, id]
    );

    return response.json(mess);
}
