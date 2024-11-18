import {
    insert,
    insertMany,
    query,
    queryOne,
    SingletonEventBus
} from '../../common';
import { IMessage } from '../../interfaces';
import { roomGetUsers } from '../room';

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

    // get users in room
    const allRoomUsers = await roomGetUsers(roomId);
    // filter without writter
    const roomUsers = allRoomUsers.filter((u) => u.id != userId);
    // prepare unread data to insert
    const unreadData: { mess_id: number; room_id: number; user_id: number }[] =
        [];
    for (const user of roomUsers) {
        unreadData.push({
            mess_id: mess.id,
            room_id: roomId,
            user_id: user.id
        });
    }
    // add unread for every seat in the room
    await insertMany('unread', unreadData, { noId: true });
    // need to sent that unread to other users
    // subscription to the room || seems not good thing
    // maybe subscribe on the user, and send all data related to user
    // -- one point to sublcribe, sounds good, but neet to check
    // need to create some event, every event shold have a type
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
