import { Request, Response } from 'express';
import { insert, query, queryOne, SingletonEventBus } from '../../common';
import { IMessage, IResponseMessage } from '../../interfaces';

export async function postMessage(
    roomId: number,
    userId: number,
    message: string
): Promise<IResponseMessage> {
    const id = await insert('mess', {
        room_id: roomId,
        created_by: userId,
        mess: message
    });
    const mess = await queryOne<IResponseMessage>(
        'SELECT ' +
            'mt.id, mt.created_at, mt.mess, ut.name, mt.created_by=$1 AS author ' +
            'FROM mess AS mt ' +
            'LEFT JOIN users AS ut ON ut.id=mt.created_by ' +
            'WHERE mt.id=$2;',
        [userId, id]
    );

    if (mess?.id) {
        const bus = SingletonEventBus.getInstance();
        bus.emit(`room_${roomId}`, null, `new message ${id}`);
    }

    return mess;
}

export async function roomGetMessages(userId: number, roomId: number) {
    return query<IMessage[]>(
        'SELECT sub.* FROM (' +
            'SELECT mt.id, mt.created_at, mt.mess, ut.name, mt.created_by=$1 AS author FROM mess AS mt LEFT JOIN users AS ut ON ut.id=mt.created_by WHERE mt.room_id=$2 ORDER BY mt.id DESC LIMIT 20' +
            ') sub ORDER BY id ASC;',
        [userId, roomId]
    );
}

export async function roomGetUpdates(
    userId: number,
    roomId: number,
    lastMessId: number
) {
    return query<IMessage[]>(
        'SELECT sub.* FROM (' +
            'SELECT mt.id, mt.created_at, mt.mess, ut.name, mt.created_by=$1 AS author FROM mess AS mt LEFT JOIN users AS ut ON ut.id=mt.created_by WHERE mt.room_id=$2 AND mt.id > $3 ORDER BY mt.id DESC LIMIT 30' +
            ') sub ORDER BY id ASC;',
        [userId, roomId, lastMessId]
    );
}
