import { insert, query, queryOne } from '../common';
import { IMessage, IRoomSeat } from '../interfaces';

export async function createRoom(userId: number, title: string) {
    const roomId = await insert('rooms', {
        title: title,
        created_by: userId
    });

    const seatId = await insert('seats', {
        user_id: userId,
        room_id: roomId,
        author: true
    });

    return {roomId, seatId};
}


export async function roomGetUserSeats(user_id: number): Promise<IRoomSeat[]> {
    const data = await query<IRoomSeat>('SELECT ST.id, ST.room_id, ST.author, RT.title FROM seats AS ST LEFT JOIN rooms AS RT ON RT.id = ST.room_id WHERE user_id=$1;',[user_id]);
    return data;
}



export async function hasUserInRoom(room_id: number, user_id: number): Promise<{id:number, author: boolean}> {
    return queryOne<{id: number, author: boolean}>(
        'SELECT id, author FROM seats WHERE room_id=$1 AND user_id=$2;',
        [room_id, user_id]
    );
}

export async function roomGetMessages (userId: number, roomId: number) {
    return query<IMessage>(
        'SELECT sub.* FROM ('+
        'SELECT mt.id, mt.created_at, mt.mess, ut.name, mt.created_by=$1 AS author FROM mess AS mt LEFT JOIN users AS ut ON ut.id=mt.created_by WHERE mt.room_id=$2 ORDER BY mt.id DESC LIMIT 20'
        +') sub ORDER BY id ASC;',
        [userId, roomId]
    );
}

export async function roomGetUpdates (userId: number, roomId: number, lastMessId: number) {
    return query<IMessage>(
        'SELECT sub.* FROM ('+
        'SELECT mt.id, mt.created_at, mt.mess, ut.name, mt.created_by=$1 AS author FROM mess AS mt LEFT JOIN users AS ut ON ut.id=mt.created_by WHERE mt.room_id=$2 AND mt.id > $3 ORDER BY mt.id DESC LIMIT 30'
        +') sub ORDER BY id ASC;',
        [userId, roomId, lastMessId]
    );
}