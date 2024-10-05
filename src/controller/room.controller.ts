import { Request, Response } from 'express';
import { createRoom, roomGetMessages, roomGetUpdates, roomGetUserSeats, hasUserInRoom } from '../model';
import { queryOne } from '../common';

export async function createRoomReq(
    request: Request,
    response: Response
) {
    const userId = parseInt(request.body.user.id);
    const title = String(request.body.title);

    const {roomId, seatId} = await createRoom(userId, title);

    return response.json({
        roomId: roomId,
        seatId: seatId,
    });
}

export async function getRoomsReq(
    request: Request,
    response: Response
): Promise<Response> {
    const userId = parseInt(request.body.user.id);
    const result = await roomGetUserSeats(userId);
    return response.json(result);
}

export async function getRoomMessagesReq(
    request: Request,
    response: Response
): Promise<Response> {
    const roomId = parseInt(request.params.id);

    const seat = await hasUserInRoom(roomId, request.body.user.id);
    if(!seat) {
        return response.status(403).json({'error':'you are not in that room!'});
    }

    const data = await roomGetMessages(request.body.user.id, roomId);

    return response.json(data);
}

export async function getRoomUpdatesReq(request: Request, response: Response) {
    const roomId = parseInt(request.params.rid);
    const lastMessId = parseInt(request.params.lmid);

    if(!roomId || (!lastMessId && lastMessId !== 0)) {
        return response.json({"error":'Incorect data'});
    }
    const updates = await roomGetUpdates(request.body.user.id, roomId, lastMessId);
    return response.json(updates );
}


export async function deleteRoomReq(
    request: Request,
    response: Response
): Promise<Response> {
    const roomId = parseInt(request.params.id);

    const seat = await hasUserInRoom(roomId, request.body.user.id);
    if(!seat) {
        return response.status(403).json({'error':'you are not in that room!'});
    }

    if(!seat.author) {
        return response.status(403).json({'error':'you are not the room author!'});
    }

   

    return response.json(seat);
}