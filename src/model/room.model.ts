import { insert, insertMany, query, queryOne, remove } from '../common';
import { IMessage, IRoomSeat, IUser } from '../interfaces';

export async function createRoom(userId: number, title: string) {
    const roomId = await insert('rooms', {
        title: title,
        created_by: userId
    });

    const seatCreated = await insert('seats', {
        user_id: userId,
        room_id: roomId,
        author: true
    }, {noId: true});

    return {roomId, seatCreated};
}


export async function roomGetUserSeats(user_id: number): Promise<IRoomSeat[]> {
    return query<IRoomSeat>('SELECT ST.room_id, ST.author, RT.title FROM seats AS ST LEFT JOIN rooms AS RT ON RT.id = ST.room_id WHERE user_id=$1;', [user_id]);
}



export async function hasUserInRoom(room_id: number, user_id: number): Promise<{room_id:number, user_id:number, author: boolean}> {
    return queryOne<{room_id:number, user_id:number, author: boolean}>(
        'SELECT room_id, user_id, author FROM seats WHERE room_id=$1 AND user_id=$2;',
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

export async function roomDelete(roomId: number) {
    // maybe  cascade delete ...
    await remove('mess', {'room_id': roomId});
    const seat = await remove('seats', {'room_id': roomId});
    const room = await remove('rooms', {'id': roomId});
    return Promise.resolve({removed: !!seat?.rowCount && !!room?.rowCount});
}

export async function seatDelete(roomId: number, userId: number) {
    const seat = await remove('seats', {'room_id': roomId, 'user_id': userId});
    return Promise.resolve({removed: !!seat?.rowCount});
}

export async function getUsersInRoom(roomId: number) {
    return query<IUser>('SELECT * FROM users WHERE id IN (SELECT user_id FROM seats WHERE room_id=$1)', [roomId]);
}

export async function seatCreate(roomId: number, users: number[]) {
    const alreadyHas = await getUsersInRoom(roomId);
    const usersId: number[] = alreadyHas.map((user:IUser)=>parseInt(String(user?.id)))
    const data = [];
    for(const userId of users) {
        if(usersId.includes(userId)) {
            continue;
        }
        data.push({user_id: userId, room_id: roomId});
    }
    if(!data.length) {
        return Promise.resolve(-1);
    }
    return insertMany('seats', data, {noId:true});
}
