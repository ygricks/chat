import {
    insert,
    insertMany,
    query,
    queryOne,
    SingletonEventBus
} from '../../common';
import { IMessage } from '../../interfaces';
import { roomGetUsers } from '../room';
import { getUnreadCount } from '../user';

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

    if (!mess?.id) {
        return Promise.reject(new Error('message not write'));
    }

    // unread
    const allRoomUsers = await roomGetUsers(roomId);
    const onlyMembers = allRoomUsers.filter((u) => u.id != userId);
    const unreadData: { mess_id: number; room_id: number; user_id: number }[] =
        [];
    for (const user of onlyMembers) {
        unreadData.push({
            mess_id: mess.id,
            room_id: roomId,
            user_id: user.id
        });
    }
    const resp = await insertMany('unread', unreadData, { noId: true });
    if(!resp) {
        throw new Error(`Can't create unread mess`)
    }

    // sse event > new message, event with unread count
    const usersIds = allRoomUsers.map((o)=>o.id);
    const unreadCount = await getUnreadCount(usersIds);

    const bus = SingletonEventBus.getInstance();
    for(const uId of usersIds) {
        bus.emit(`user_${uId}`, null, {
            type: 'newMessage',
            mess: mess,
            unread: unreadCount[String(uId)]
        });
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
