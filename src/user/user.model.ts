import { query } from "../common";

type InviteUser = {
    id: number,
    name: string
}

export async function getUsersNotInRoom(name: string, roomId: number): Promise<InviteUser[]> {
    return query<InviteUser[]>('SELECT id, name FROM users WHERE id NOT IN (SELECT user_id FROM seats WHERE room_id=$1) AND name LIKE $2;', [roomId, `%${name}%`]);
}
