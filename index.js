const electron = require('electron')
const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash');

const { app, BrowserWindow, ipcMain } = electron;

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    }
  });

  mainWindow.loadURL(`file://${__dirname}/src/index.html`);
});

ipcMain.on('videos:added', (event, videos) => {

  const promises = _.map(videos, video => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(video.path, (err, medatada) => {
        resolve({
          ...video,
          duration: medatada.format.duration,
          format: 'avi'
        });
      });
    });
  });

  Promise.all(promises)
  .then((results) => {
    mainWindow.webContents.send('metadata:complete', results);
  });
});

ipcMain.on('conversion:start', (event, videos) => {
  _.each(videos, video => {
    const outputDirectory = video.path.split(video.name)[0];
    const outputName = video.name.split('.')[0];
    const outputPath = `${outputDirectory}${outputName}.${video.format}`;

    ffmpeg(video.path)
      .output(outputPath)
      .on('end', () => console.log('Video conversion complete.'))
      .run();
  });
});
