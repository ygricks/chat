import { insert } from "../common";

export async function createRef(userId: number) {
    const ref = {
        created_by: userId,
        ref: (Math.random() + 1).toString(36).substring(2),
    }

    const add = await insert('refs', ref);
    const result:string = add ? ref.ref : '';
    return result;
}
