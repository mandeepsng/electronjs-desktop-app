const os = require('os');
const fs = require('fs');
const csv = require('csv-parser');
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile')
})

contextBridge.exposeInMainWorld('path', {
  join: () => os.homedir()
})

contextBridge.exposeInMainWorld('fs', {
  readFileSync: fs.readFileSync,
  writeFile: fs.writeFile
})

// Expose csv-parser module
contextBridge.exposeInMainWorld('csv', {
  parse: csv.parse,
  parseStream: csv.parseStream,
});

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: require('electron').ipcRenderer
})