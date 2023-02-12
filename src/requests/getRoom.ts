import { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function getRoom(
    request: Request,
    response: Response
): Promise<Response> {
    const result = readFileSync(join(__dirname, '../../public/__home__.html'), 'utf-8');
    return response.send(
        result
    );
}
