import { Request, Response } from 'express';
import { createRef } from '.';


export async function postRefReq(
    request: Request,
    response: Response
) {
    const result = await createRef(request.body.user.id);

    return response.json({ref: result});
}
