import { QueryResult } from 'pg';
import { insert, insertMany, query, queryOne, remove } from '../common';
import { IMessage, IRoomSeat, IUser } from '../interfaces';

export async function createRoom(userId: number, title: string) {
    const roomId = await insert('rooms', {
        title: title,
        created_by: userId
    });

    const seatCreated = await insert(
        'seats',
        {
            user_id: userId,
            room_id: roomId,
            author: true
        },
        { noId: true }
    );

    return { roomId, seatCreated };
}

export async function roomGetUserSeats(user_id: number): Promise<IRoomSeat[]> {
    return query<IRoomSeat[]>(
        'SELECT ST.room_id, ST.author, RT.title FROM seats AS ST LEFT JOIN rooms AS RT ON RT.id = ST.room_id WHERE user_id=$1;',
        [user_id]
    );
}

export async function hasUserInRoom(
    room_id: number,
    user_id: number
): Promise<{ room_id: number; user_id: number; author: boolean }> {
    return queryOne<{ room_id: number; user_id: number; author: boolean }>(
        'SELECT room_id, user_id, author FROM seats WHERE room_id=$1 AND user_id=$2 LIMIT 1;',
        [room_id, user_id]
    );
}

export async function roomGetOnlyMembers(room_id: number) {
    return query<{ id: string; name: string }[]>(
        'SELECT id, name FROM users WHERE id IN (SELECT user_id from seats WHERE room_id=$1 AND author=false);',
        [room_id]
    );
}

export async function syncRoomMembers(roomId: number, users: number[]) {
    const members: number[] = await roomGetOnlyMembers(roomId).then((data) => {
        return data.map((u) => parseInt(u.id));
    });
    const toAdd = users.filter((id) => !members.includes(id));
    const toDel = members.filter((id) => !users.includes(id));
    let delited = -1;
    let added = -1;
    if (toDel.length) {
        const places = Object.keys(toDel)
            .map((k) => '$' + (2 - -k))
            .join(', ');
        const sql = `DELETE FROM seats WHERE room_id=$1 AND user_id IN (${places});`;
        const result = await query<{ rowCount: number }>(
            sql,
            [roomId, ...toDel],
            { raw: true }
        );
        delited = result?.rowCount;
    }
    if (toAdd.length) {
        const data = [];
        for (const userId of toAdd) {
            data.push({ room_id: roomId, user_id: userId });
        }
        added = await insertMany('seats', data, { noId: true });
    }
    const manim = `${added}:${delited}`;

    return manim;
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

export async function roomDelete(roomId: number) {
    // maybe  cascade delete ...
    await remove('mess', { room_id: roomId });
    const seat = await remove('seats', { room_id: roomId });
    const room = await remove('rooms', { id: roomId });
    return Promise.resolve({ removed: !!seat?.rowCount && !!room?.rowCount });
}

export async function seatDelete(roomId: number, userId: number) {
    const seat = await remove('seats', { room_id: roomId, user_id: userId });
    return Promise.resolve({ removed: !!seat?.rowCount });
}
