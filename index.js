const electron = require('electron')
const { app, BrowserWindow } = electron;

app.on('ready', () => {
  new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    }
  }
});
