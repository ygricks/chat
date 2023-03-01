import express from 'express';
import { config } from 'dotenv';
import bodyParser from 'body-parser';
import { safeCall } from './common';
import { getInfo, getRoomMassages } from './requests';
import { getRoom } from './requests/getRoom';
import { postMessage } from './requests/postMessege';
import { postLogin } from './requests/postLogin';
import cookieParser from 'cookie-parser';
import { isAuthorized } from './common/auth';
import {getRooms} from "./requests/getRooms";

config();

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());

app.get('/', safeCall(getInfo));
app.post('/api/login', safeCall(postLogin));

app.get('/rooms', isAuthorized, safeCall(getRooms));
app.get('/room/:id', isAuthorized, safeCall(getRoom));
app.post('/room/:id', isAuthorized, safeCall(getRoom));
app.get('/api/room/:id', isAuthorized, safeCall(getRoomMassages));
app.post('/api/room/:id', isAuthorized, safeCall(postMessage));

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, async () => {
    console.log(`App listening on http://localhost:${PORT}`);
});
