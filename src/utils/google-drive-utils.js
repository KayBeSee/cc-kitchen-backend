import fs from 'fs';
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive.appdata'];

// const drive = google.drive({
//   version: 'v2',
//   auth: oauth2Client
// });

export const getAuthUrl = (oauth2Client) => {
  return {
    url: oauth2Client.generateAuthUrl({
      access_type: 'online',
      scope: SCOPES,
    })
  }
};

export const getFiles = async (oauth2Client) => {
  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
  });

  try {
    const { data } = await drive.files.list({
      spaces: 'appDataFolder',
      // spaces: 'drive',
      q: "mimeType='text/plain'",
      fields: '*',
      pageSize: 100
    });

    const { data: fileData } = await drive.files.get({
      fileId: data.files[0].id,
      alt: 'media',
      fields: 'webContentLink',
    });

    return fileData;

  } catch (e) {
    console.log('gdrive error: ', e);
  }
}

export const saveFileToGoogleDrive = async (oauth2Client, file) => {
  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
  });

  var fileMetadata = {
    'name': `config-${Date.now()}.txt`,
    'parents': ['appDataFolder']
  };
  var media = {
    mimeType: 'text/plain',
    body: file
  };
  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  }, function (err, file) {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('Folder Id:', file);
    }
  });
}