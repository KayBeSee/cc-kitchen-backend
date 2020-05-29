import "regenerator-runtime/runtime";

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express()
const port = 3000

const { google } = require('googleapis');
import { GOOGLE_DRIVE } from './config';

const {
  client_id,
  client_secret,
  redirect_uris
} = GOOGLE_DRIVE;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());
app.use(cors());


const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[1]
);

import { enumerate, getXPub, signtx } from './utils/other-commands';
import { getAuthUrl, getFiles, saveFileToGoogleDrive } from './utils/google-drive-utils';
import { async } from "regenerator-runtime/runtime";

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

app.get('/get-gdrive-auth-url', async (req, res) => {
  const url = await getAuthUrl(oauth2Client);
  return res.json(url)
})

app.get('/authorize', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.redirect('http://localhost:3001/gdrive-import');
  } catch (e) {
    console.log('error: ', e);
  }
});

app.get('/files', async (req, res) => {
  const file = await getFiles(oauth2Client);
  return res.json(file);
})

app.post('/files', async (req, res) => {
  const { file } = req.body;
  console.log('file: ', file);
  await saveFileToGoogleDrive(oauth2Client, file);
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))