const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('load-home');
  });

  // Listen for the 'add-music' event from the renderer process
  ipcMain.on('add-music', () => {
    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Music Files', extensions: ['mp3', 'wav', 'ogg', 'flac'] },
      ],
    }).then((result) => {
      if (!result.canceled) {
        const files = result.filePaths;
        mainWindow.webContents.send('display-music-files', files); // Send the selected files to the renderer process
      }
    }).catch((err) => {
      console.error("Error while opening file Explorer:", err);
    });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
