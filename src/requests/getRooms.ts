import { Request, Response } from 'express';
import { roomGetUserSeats } from '../common';

export async function getRooms(
    request: Request,
    response: Response
): Promise<Response> {
    const userId = parseInt(request.body.user.id);
    const result = await roomGetUserSeats(userId);
    return response.json(result);
}
