const { app, BrowserWindow, ipcMain, dialog, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const https = require('https')
const csv = require('csv-parser')
const electronReload = require('electron-reload')

electronReload(__dirname)


async function handleFileOpen () {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (canceled) {

  } else {
    
    // return filePaths[0]
    // return 'sdfsdf sdfsdf'
    fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (data) => {
      // ipcRenderer.send('csv-data', data)
      console.log(data)
      return data;
    })
    .on('end', () => {
      // ipcRenderer.send('csv-data-end')
      return 'csv-data-end';
    })

  }
}

function createWindow () {
  const win = new BrowserWindow({
    width: 1800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
    }
  })

  // open dev tools
  win.webContents.openDevTools()

  win.loadFile('index.html')

}


app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', handleFileOpen)
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

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