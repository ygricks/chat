import { Request, Response } from 'express';
import { insert, query, queryOne } from '../common';
import { SingletonEventBus } from '../common/SingletonEventBus';
import { IResponseMessage } from '../interfaces';

export async function postMessage(
    request: Request,
    response: Response
): Promise<Response> {
    const userId = parseInt(request.body.user.id);
    const roomId = parseInt(request.params.id);
    const message = request.body.message;

    const data = {
        room_id: roomId,
        created_by: userId,
        mess: message
    };

    const id = await insert('mess', data);
    const mess = await queryOne<IResponseMessage>(
        'SELECT ' +
            'mt.id, mt.created_at, mt.mess, ut.name, mt.created_by=$1 AS author ' +
            'FROM mess AS mt ' +
            'LEFT JOIN users AS ut ON ut.id=mt.created_by ' +
            'WHERE mt.id=$2;',
        [request.body.user.id, id]
    );

    const bus = SingletonEventBus.getInstance();

    if (mess?.id) {
        bus.emit(`room_${roomId}`, null, `new message ${id}`);
    }

    return response.json(mess);
}
