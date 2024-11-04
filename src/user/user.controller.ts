import { Request, Response } from 'express';
import { hasUserInRoom } from '../model';
import { getUsersNotInRoom } from '.';

export async function getUsersInviteReq(
    request: Request,
    response: Response
): Promise<Response> {
    const roomId = parseInt(request.query.roomId as string);
    const name = String(request.query.name);
    const seat = await hasUserInRoom(roomId, request.body.user.id);

    if (!seat) {
        return response
            .status(403)
            .json({ error: 'you are not in that room!' });
    }
    if (!seat.author) {
        return response
            .status(403)
            .json({ error: 'only the room owner can invite' });
    }

    const users = await getUsersNotInRoom(name, roomId);

    return response.json({ users });
}
