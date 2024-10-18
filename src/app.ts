import express from 'express';
import { config } from 'dotenv';
import bodyParser from 'body-parser';
import { safeCall, isAuthorized, SingletonEventBus, postLogin } from './common';
import cookieParser from 'cookie-parser';
import { postMessage } from './requests';
// import { hashSync } from 'bcryptjs';
// import {Request, Response} from 'express';
import { pageLogin, pageMain, pageRoomChat } from './pages';
import { createRoomReq, deleteRoomReq, deleteSeatReq, getRoomMessagesReq, getRoomsReq, getRoomUpdatesReq, postSeatReq } from './controller';
import { hasUserInRoom } from './model';
import { getUsersInviteReq } from './user';

config();

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());

app.get('/', isAuthorized, safeCall(pageMain));
app.get('/login', safeCall(pageLogin));
app.get('/room/:id', isAuthorized, safeCall(pageRoomChat));

app.get('/api/rooms', isAuthorized, safeCall(getRoomsReq));
app.get('/api/room/:id', isAuthorized, safeCall(getRoomMessagesReq));
app.get('/api/user', isAuthorized, safeCall(getUsersInviteReq));
app.delete('/api/room/:id', isAuthorized, safeCall(deleteRoomReq));
app.delete('/api/room/seat/:id', isAuthorized, safeCall(deleteSeatReq));
app.post('/api/room/seat', isAuthorized, safeCall(postSeatReq));
app.get('/api/room/:rid/:lmid', isAuthorized, safeCall(getRoomUpdatesReq));
app.post('/api/room', isAuthorized, safeCall(createRoomReq));
app.post('/api/room/:id', isAuthorized, safeCall(postMessage));
app.post('/api/login', safeCall(postLogin));

app.get("/stream/:id", isAuthorized, async (request, res) => {
    const userId = request.body.user.id;
    const roomId = parseInt(request.params.id);

    const seat = await hasUserInRoom(roomId, userId);
    if(!seat) {
        return res.status(403).json({'error':'you are not in that room!'});
    }

    res.writeHead(200, {
      "Connection": "keep-alive",
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream",
    });

    const bus = SingletonEventBus.getInstance();
    const callback = function(e: number) {
      console.log('>>> on room ' + roomId, e)
      const chunk = JSON.stringify({mess: 'got new message'});
      res.write(`data: ${chunk}\n\n`);
    };
    bus.on(`room_${roomId}`, callback);

    res.on("close", () => {
      bus.detach(`room_${roomId}`, callback);
      res.end();
    });
  });

// @TODO remove
// app.get('/sign', safeCall(async function getRoom(
//     request: Request,
//     response: Response
// ): Promise<Response> {
//     return response.send({hashedPassword:hashSync('123', 10)});
// }));

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, async () => {
    console.log(`App listening on http://localhost:${PORT}`);
});
