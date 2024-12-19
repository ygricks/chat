import { query } from '../../common';

type InviteUser = {
    id: number;
    name: string;
};

export async function getUsersNotInRoom(
    name: string,
    roomId: number
): Promise<InviteUser[]> {
    return query<InviteUser[]>(
        'SELECT id, name FROM users WHERE id NOT IN (SELECT user_id FROM seats WHERE room_id=$1) AND name LIKE $2;',
        [roomId, `%${name}%`]
    );
}

export async function getUnreadCount(usersIds: number[]) {
    const template: string = ((len) => {
        let t: string[] = [];
        for (let i = 1; i <= len; i++) {
            const e = `$${i}`;
            t.push(`$${i}`);
        }
        return t.join(', ');
    })(usersIds.length);

    const data = await query<
        { user_id: number; room_id: number; count: number }[]
    >(
        `SELECT user_id, room_id, COUNT(*) AS count FROM unread WHERE user_id IN (${template}) GROUP BY (room_id, user_id);`,
        [...usersIds]
    );

    const sket: { [key: string]: { [key: string]: number } } = {};
    for (const line of data) {
        const uid = String(line.user_id);
        const rid = String(line.room_id);
        if (!(uid in sket)) {
            sket[uid] = {};
        }
        sket[uid][rid] = parseInt(String(line.count));
    }
    return sket;
}
