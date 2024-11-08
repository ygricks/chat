import { Request, Response } from 'express';
import { hasUserInRoom } from '../room';
import { roomGetMessages } from '.';
import { postMessage } from '.';

export async function postMessageReq(
    request: Request,
    response: Response
): Promise<Response> {
    const userId = parseInt(request.body.user.id);
    const roomId = parseInt(request.params.id);
    const message = request.body.message;

    const seat = await hasUserInRoom(roomId, userId);
    if (!seat) {
        return response
            .status(403)
            .json({ error: 'you are not in that room!' });
    }

    const mess = await postMessage(roomId, request.body.user.id, message);

    return response.json(mess);
}

export async function getRoomMessagesReq(
    request: Request,
    response: Response
): Promise<Response> {
    const roomId = parseInt(request.params.id);
    const userId = parseInt(request.body.user.id);

    const seat = await hasUserInRoom(roomId, userId);
    if (!seat) {
        return response
            .status(403)
            .json({ error: 'you are not in that room!' });
    }

    const data = await roomGetMessages(userId, roomId);

    return response.json(data);
}
