import express from 'express';
import { config } from 'dotenv';
import bodyParser from 'body-parser';
import { safeCall } from './common';
import { getInfo, getRoomMassages } from './requests';
import { getRoom } from "./requests/getRoom";

config();

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'))

app.get('/api/room/:id', safeCall(getRoomMassages));
app.get('/room/:id', safeCall(getRoom));
app.get('/', safeCall(getInfo));

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, async () => {
    console.log(`App listening on http://localhost:${PORT}`);
});
