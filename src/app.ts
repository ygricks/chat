import express from 'express';
import { config } from 'dotenv';
import bodyParser from 'body-parser';
import { safeCall } from './common';
import { getInfo, getRoomMassages } from './requests';
// import { getRoom } from './requests/getRoom';
import { postMessage } from './requests/postMessege';
import { postLogin } from './requests/postLogin';
import cookieParser from 'cookie-parser';
import { getRoom, rooms, getRoomsPage } from './requests/rooms';
// import { hashSync } from 'bcryptjs';
// import {Request, Response} from 'express';
import { isAuthorized } from './common/login';

config();

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());

app.get('/', safeCall(getInfo));
app.post('/api/login', safeCall(postLogin));

app.get('/rooms', isAuthorized, safeCall(getRoomsPage));
app.get('/api/rooms', isAuthorized, safeCall(rooms));
app.get('/room/:id', isAuthorized, safeCall(getRoom));
app.get('/api/room/:id', isAuthorized, safeCall(getRoomMassages));
app.post('/api/room/:id', isAuthorized, safeCall(postMessage));

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
