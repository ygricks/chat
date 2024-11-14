import { insert, query, queryOne, SingletonEventBus } from '../../common';
import { IMessage } from '../../interfaces';

export async function postMessage(
    roomId: number,
    userId: number,
    message: string
): Promise<IMessage> {
    const messId = await insert('mess', {
        room_id: roomId,
        created_by: userId,
        mess: message
    });
    const mess = await queryOne<IMessage>('SELECT * FROM mess WHERE id=$1;', [
        messId
    ]);

    if (mess?.id) {
        const bus = SingletonEventBus.getInstance();
        bus.emit(`room_${roomId}`, null, mess);
    }

    return mess;
}

export async function roomGetMessages(roomId: number) {
    return query<IMessage[]>(
        'SELECT sub.* FROM (' +
            'SELECT mt.id, mt.created_at, mt.mess, mt.created_by FROM mess AS mt LEFT JOIN users AS ut ON ut.id=mt.created_by WHERE mt.room_id=$1 ORDER BY mt.id DESC LIMIT 20' +
            ') sub ORDER BY id ASC;',
        [roomId]
    );
}

export async function roomGetUpdates(roomId: number, lastMessId: number) {
    return query<IMessage[]>(
        'SELECT sub.* FROM (' +
            'SELECT mt.id, mt.created_at, mt.mess FROM mess AS mt LEFT JOIN users AS ut ON ut.id=mt.created_by WHERE mt.room_id=$1 AND mt.id > $2 ORDER BY mt.id DESC LIMIT 30' +
            ') sub ORDER BY id ASC;',
        [roomId, lastMessId]
    );
}
