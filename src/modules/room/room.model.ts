import {
    insert,
    insertMany,
    qTemp,
    query,
    queryOne,
    remove,
    SingletonEventBus
} from '../../common';
import { MembersChangeEvent, MembersChangeType } from '../../Event';
import { IPublicUser, IRoomSeat } from '../../interfaces';
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

interface IRMember extends IPublicUser {
    author: boolean;
}

export async function roomGetUsers(roomId: number): Promise<IRMember[]> {
    return query<IRMember[]>(
        'SELECT u.id, u.name, s.author FROM users AS u LEFT JOIN seats AS s ON s.user_id = u.id WHERE s.room_id = $1;',
        [roomId]
    );
}

export async function roomGetOnlyMembers(
    roomId: number
): Promise<IPublicUser[]> {
    const users = await roomGetUsers(roomId);
    return Promise.resolve(users.filter((u) => !u.author) as IPublicUser[]);
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

export async function syncRoomMembers(
    roomId: number,
    usersID: number[],
    ownerId: number
) {
    const users = usersID.length
        ? await query<IPublicUser[]>(
              `SELECT id,name FROM users WHERE id IN (${qTemp(
                  usersID.length
              )})`,
              [...usersID]
          )
        : [];
    const members = (await roomGetOnlyMembers(roomId)) as IPublicUser[];
    const membID = members.map((o) => parseInt(String(o.id)));
    const all: { [key: string]: IPublicUser } = {};
    [...users, ...members].map((o) => {
        all[o.id] = o;
    });

    const toAdd = usersID.filter((id) => !membID.includes(id));
    const toDel = membID.filter((id) => !usersID.includes(id));
    const eventData: MembersChangeType = { add: [], kick: [] };

    if (toDel.length) {
        const sql = `DELETE FROM seats WHERE room_id=$1 AND user_id IN (${qTemp(
            toDel.length,
            2
        )});`;
        await query<{ rowCount: number }>(sql, [roomId, ...toDel], {
            raw: true
        });
        for (const uId of toDel) {
            eventData.kick.push(all[String(uId)]);
        }
    }
    if (toAdd.length) {
        const data = [];
        for (const uID of toAdd) {
            data.push({ room_id: roomId, user_id: uID });
            eventData.add.push(all[String(uID)]);
        }
        await insertMany('seats', data, { noId: true });
    }
    const bus = SingletonEventBus.getInstance();
    const event = new MembersChangeEvent(eventData);
    bus.emit(`user_${ownerId}`, null, event);
    return Promise.resolve(eventData);
}

export async function roomDelete(roomId: number) {
    // @TODO maybe  cascade delete ...
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
    const users: IPublicUser[] = roomUsers.map((u) => {
        return { id: u.id, name: u.name };
    });
    return Promise.resolve({ messages, users });
}
