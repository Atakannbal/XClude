const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { createZip } = require('../services/zip')
const { opendir } = require('fs/promises');

ipcMain.on('ondrop', async (event, path) => {
  try  {
      const folders = [];
      const dir = await opendir(path);
      for await (const dirent of dir) {
        folders.push(dirent.name);
      }
      event.returnValue = folders
    }
  catch (error) {
      console.log(error);
  }
})

ipcMain.on('onsubmit', (event, payload) => {
  const {outputPath, excludedFiles, folderPath} = payload;
  createZip(folderPath, outputPath, excludedFiles)
  event.returnValue = null
})

ipcMain.on('opendialog', (event, args) => {
 const filePaths = dialog.showOpenDialogSync( {
    title: 'Output Folder',
    properties: [
      'openDirectory',
      'createDirectory',
    ],
    message: 'Choose the output folder where you want your zipped file'
  })
  event.returnValue = filePaths[0];
})

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
