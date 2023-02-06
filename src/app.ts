import express from 'express';
import { config } from 'dotenv';
// import { getById } from './db';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { safeCall } from './common';
import { getInfo, getRoomMassages } from './requests';

config();

var app = express();

app.use(bodyParser.json());

app.get('/room/:id', safeCall(getRoomMassages));
app.get('/', safeCall(getInfo));

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, async () => {
    console.log(`App listening on http://localhost:${PORT}`);
});
