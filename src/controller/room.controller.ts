import { Request, Response } from 'express';
import { createRoom, roomGetMessages, roomGetUpdates, roomGetUserSeats, hasUserInRoom, roomDelete, seatDelete, roomGetOnlyMembers, syncRoomMembers } from '../model';

export async function createRoomReq(
    request: Request,
    response: Response
) {
    const userId = parseInt(request.body.user.id);
    const title = String(request.body.title);

    const {roomId, seatCreated} = await createRoom(userId, title);

    return response.json({
        roomId: roomId,
        seatCreated: seatCreated,
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

export async function getRoomMembersReq(request: Request, response: Response) {
    const roomId = parseInt(request.params.rid);
    const seat = await hasUserInRoom(roomId, request.body.user.id);
    if(!seat) {
        return response.status(403).json({'error':'you are not in that room!'});
    }
    if(!seat.author) {
        return response.status(403).json({'error':'only room owner can do that!'});
    }
    const members = await roomGetOnlyMembers(roomId);
    return response.json({members});
}

export async function postRoomMembersReq(request: Request, response: Response) {
    const roomId = parseInt(request.params.rid);
    const seat = await hasUserInRoom(roomId, request.body.user.id);
    if(!seat) {
        return response.status(403).json({'error':'you are not in that room!'});
    }
    if(!seat.author) {
        return response.status(403).json({'error':'only room owner can do that!'});
    }
    const users: number[] = ((users=[])=>users.map((i:string)=>parseInt(i)))(request.body.users);
    const result = await syncRoomMembers(roomId, users);
    return response.json({ done: 1 , result });
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

    const result = await roomDelete(roomId);

    return response.json(result);
}

export async function deleteSeatReq(
    request: Request,
    response: Response
): Promise<Response> {
    const roomId = parseInt(request.params.id);
    const seat = await hasUserInRoom(roomId, request.body.user.id);
    if(!seat) {
        return response.status(403).json({'error':'you are not in that room!'});
    }
    if(seat.author) {
        return response.status(403).json({'error':'you can not leave your room!'});
    }

    const result = await seatDelete(roomId, request.body.user.id);

    return response.json(result);
}
