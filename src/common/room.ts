import { insert, query, queryOne } from "./db";

export async function roomHasUserASeat(room_id: number, user_id: number): Promise<boolean> {
    const data = await queryOne<{id: number, author: boolean}>(
        'SELECT id, author FROM seats WHERE room_id=$1 AND user_id=$2;',
        [room_id, user_id]
    );

    return Promise.resolve(!!data?.id);
}

interface RoomSeat{
    id: number,
    title: string,
    room_id: number,
    author: boolean
}

export async function roomGetUserSeats(user_id: number): Promise<RoomSeat[]> {
    const data = await query<RoomSeat>('SELECT ST.id, ST.room_id, ST.author, RT.title FROM seats AS ST LEFT JOIN rooms AS RT ON RT.id = ST.room_id WHERE user_id=$1;',[user_id]);
    return data;
}


import { Request, Response } from 'express';

export async function createRoom(
    request: Request,
    response: Response
) {
    const userId = parseInt(request.body.user.id);
    const title = String(request.body.title);

    const roomId = await insert('rooms', {
        title: title,
        created_by: userId
    });

    const seatId = await insert('seats', {
        user_id: userId,
        room_id: roomId,
        author: true
    })

    return response.json({
        roomId: roomId,
        seatId: seatId,
    })
}
