import express from 'express';
import { config } from 'dotenv';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import {
    safeCall,
    isAuthorized,
    SingletonEventBus,
    postLogin,
    ErrorCode
} from './common';
import { pageLogin, pageMain, pageRegister, pageRoomChat } from './pages';
import {
    createRoomReq,
    deleteRoomReq,
    deleteSeatReq,
    getRoomDataReq,
    getRoomMembersReq,
    getRoomsReq,
    getRoomUpdatesReq,
    postRoomMembersReq
} from './modules/room';
import { getUsersInviteReq } from './modules/user';
import { checkRegisterDataReq, postRefReq, registerReq } from './modules/ref';
import { postMessageReq } from './modules/message';

config();

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());

app.get('/', isAuthorized, safeCall(pageMain));
app.get('/login', safeCall(pageLogin));
app.get('/room/:id', isAuthorized, safeCall(pageRoomChat));

app.get('/api/rooms', isAuthorized, safeCall(getRoomsReq));
app.get('/api/room/:id', isAuthorized, safeCall(getRoomDataReq));
app.get('/api/user', isAuthorized, safeCall(getUsersInviteReq));
app.get('/api/room/:rid/members', isAuthorized, safeCall(getRoomMembersReq));
app.post('/api/room/:rid/members', isAuthorized, safeCall(postRoomMembersReq));
app.delete('/api/room/:id', isAuthorized, safeCall(deleteRoomReq));
app.delete('/api/room/seat/:id', isAuthorized, safeCall(deleteSeatReq));
app.get('/api/room/:rid/:lmid', isAuthorized, safeCall(getRoomUpdatesReq));
app.post('/api/room', isAuthorized, safeCall(createRoomReq));
app.post('/api/room/:id', isAuthorized, safeCall(postMessageReq));
app.post('/api/login', safeCall(postLogin));
// register
app.post('/api/ref', isAuthorized, safeCall(postRefReq));
app.get('/ref/:ref_name', safeCall(pageRegister));
app.post('/api/ref/:ref_name/loginCheck', safeCall(checkRegisterDataReq));
app.post('/api/ref/:ref_name/register', safeCall(registerReq));

app.get('/stream', isAuthorized, async (request, res) => {
    const userId = request.body.user.id;

    res.writeHead(200, {
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream'
    });

    const bus = SingletonEventBus.getInstance();
    const callback = function (e: object | string) {
        const chunk = JSON.stringify(e);
        res.write(`data: ${chunk}\n\n`);
    };
    bus.on(`user_${userId}`, callback);

    res.on('close', () => {
        bus.detach(`user_${userId}`, callback);
        res.end();
    });
});

app.use(async (req, res, next) => {
    const html = await ErrorCode({ code: '404', title: 'page not found' });
    res.status(404).send(html);
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, async () => {
    console.log(`App listening on http://localhost:${PORT}`);
});
