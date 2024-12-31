import { insert, insertMany, query, queryOne, remove } from '../../common';
import { IMember, IRoomSeat, IUser } from '../../interfaces';
import { roomGetMessages } from '../message';

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

export async function roomGetSeats(userId: number): Promise<IRoomSeat[]> {
    return query<IRoomSeat[]>(
        'SELECT ST.room_id, ST.author, RT.title FROM seats AS ST LEFT JOIN rooms AS RT ON RT.id = ST.room_id WHERE user_id=$1;',
        [userId]
    );
}

interface Member extends Omit<IUser, 'password'> {
    author: boolean;
}

export async function roomGetUsers(roomId: number): Promise<Member[]> {
    return query<Member[]>(
        'SELECT u.id, u.name, s.author FROM users AS u LEFT JOIN seats AS s ON s.user_id = u.id WHERE s.room_id = $1;',
        [roomId]
    );
}

type PublicUser = Omit<Member, 'author'>;

export async function roomGetOnlyMembers(
    roomId: number
): Promise<PublicUser[]> {
    const users = await roomGetUsers(roomId);
    return Promise.resolve(users.filter((u) => !u.author) as PublicUser[]);
}

export async function hasUserInRoom(
    roomId: number,
    userId: number
): Promise<{ room_id: number; user_id: number; author: boolean }> {
    return queryOne<{ room_id: number; user_id: number; author: boolean }>(
        'SELECT room_id, user_id, author FROM seats WHERE room_id=$1 AND user_id=$2 LIMIT 1;',
        [roomId, userId]
    );
}

export async function syncRoomMembers(roomId: number, users: number[]) {
    const members: number[] = await roomGetOnlyMembers(roomId).then((data) => {
        return data.map((u) => parseInt(String(u.id)));
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

export async function getRoomData(roomId: number) {
    const messages = await roomGetMessages(roomId);
    const roomUsers = await roomGetUsers(roomId);
    const users: IMember[] = roomUsers.map((u) => {
        return { id: u.id, name: u.name };
    });
    return Promise.resolve({ messages, users });
}
