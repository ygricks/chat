import { Request, Response } from 'express';
import { insert, query, queryOne } from '../common';

export async function postMessage(
    request: Request,
    response: Response
): Promise<Response> {
    const {
        params: { id: roomId },
        body: { message, author }
    } = request;

    const id = await insert('mess', { room_id: roomId, mess: message, author });
    const mess = await queryOne(`SELECT * FROM mess WHERE id=$1 order by id`, [
        id
    ]);

    // fake massege register
    // function randomIntFromInterval(min:number, max:number):number { // min and max included
    //     return Math.floor(Math.random() * (max - min) + min)
    // }
    // const id = randomIntFromInterval(7,200);

    return response.json(mess);
}
