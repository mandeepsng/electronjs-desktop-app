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
    return null;
  } 
  const results = await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePaths[0]).pipe(csv({ headers: true }));

    const data = [];
    stream.on('data', (d) => {
      data.push(d);
    });

    stream.on('end', () => {
      resolve(data);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });


  // console.log(results);
  return results;
}


ipcMain.on('read-csv', (event, filePath) => {
  const results = []
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      results.push(data)
      event.sender.send('csv-data', data)
    })
    .on('end', () => {
      event.sender.send('csv-data-end')
      console.log(results)
    })
})

function createWindow () {
  const win = new BrowserWindow({
    width: 1800,
    height: 700,
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

ipcMain.on('test:msg',(e, options) => {
  console.log(options)
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})