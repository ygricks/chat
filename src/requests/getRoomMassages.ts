import { Request, Response } from 'express';
import { query, roomHasUserASeat } from '../common';

type Message = {
    id: number,
    created_at: string,
    mess: string,
    author: string,
    name: string
}

export async function getRoomMassages(
    request: Request,
    response: Response
): Promise<Response> {
    const roomId = parseInt(request.params.id);

    const seat = await roomHasUserASeat(roomId, request.body.user.id);
    if(!seat) {
        return response.status(403).json({'error':'you are not in that room!'});
    }

    const data = await query<Message>(
        'SELECT sub.* FROM ('+
        'SELECT mt.id, mt.created_at, mt.mess, ut.name, mt.created_by=$1 AS author FROM mess AS mt LEFT JOIN users AS ut ON ut.id=mt.created_by WHERE mt.room_id=$2 ORDER BY mt.id DESC LIMIT 20'
        +') sub ORDER BY id ASC;',
        [request.body.user.id, roomId]
    );

    return response.json(data);
}

export async function getRoomUpdates(request: Request, response: Response) {
    const roomId = parseInt(request.params.rid);
    const lastMessId = parseInt(request.params.lmid);

    if(!roomId || (!lastMessId && lastMessId !== 0)) {
        return response.json({"error":'Incorect data'});
    }
    const updates = await query<Message>(
        'SELECT sub.* FROM ('+
        'SELECT mt.id, mt.created_at, mt.mess, ut.name, mt.created_by=$1 AS author FROM mess AS mt LEFT JOIN users AS ut ON ut.id=mt.created_by WHERE mt.room_id=$2 AND mt.id > $3 ORDER BY mt.id DESC LIMIT 30'
        +') sub ORDER BY id ASC;',
        [request.body.user.id, roomId, lastMessId]
    );
    return response.json(updates );
}
