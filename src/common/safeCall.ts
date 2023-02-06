import { Request, Response, RequestHandler } from 'express';

export function safeCall(funct: RequestHandler): RequestHandler {
    return async (
        request: Request,
        response: Response,
        next: (error: any) => void
    ): Promise<any> => {
        try {
            console.log(`\x1b[36m> ${funct.name}`);
            await funct(request, response, next);
        } catch (err) {
            const error = err as { message: string };
            const message: string = error?.message
                ? error.message
                : 'Something went wrong';
            Object.defineProperty(err, 'message', message);
            next(err);
        }
    };
}
