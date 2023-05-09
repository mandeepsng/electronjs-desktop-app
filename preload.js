const os = require('os');
const fs = require('fs');
const csv = require('csv-parser');
const pdf = require('html-pdf');
const ejs = require('ejs');
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
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

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) =>  ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args) ) ,
})

contextBridge.exposeInMainWorld('pdf', pdf);
contextBridge.exposeInMainWorld('ejs', ejs);