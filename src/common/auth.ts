import { Response, Request, NextFunction } from 'express';
import { queryOne } from './db';
import { IUser } from '../interfaces';

export function isAuthorized(req: Request, res: Response, next: NextFunction) {
    queryOne<IUser>(
        'SELECT ut.* FROM sessions AS st LEFT JOIN users AS ut ON ut.id=st.user_id WHERE hash=$1 and expired_at>NOW()',
        [String(req.cookies['SESSID'])]
    ).then((user) => {
        if (!user || !user.id) {
            res.redirect('/login.html');
            return next(new Error('Access Denied'));
        }
        const keys = Object.keys(req);
        req.body.user = user;
        next();
    });
}
