import "regenerator-runtime/runtime";

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express()
const port = 3000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());
app.use(cors());

import { enumerate, getXPub, signtx } from './utils/other-commands';

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/enumerate', async (req, res) => {
  const devices = await enumerate();
  return res.json(devices);
});

app.post('/xpub', async (req, res) => {
  const { deviceType, devicePath, path } = req.body;
  const xpub = await getXPub(deviceType, devicePath, path)
  return res.send(xpub);
});

app.post('/sign', async (req, res) => {
  const { deviceType, devicePath, psbt } = req.body;
  const signedPsbt = await signtx(deviceType, devicePath, psbt);
  return res.send(signedPsbt);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))