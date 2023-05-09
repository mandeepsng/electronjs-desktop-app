const { app, BrowserWindow, ipcMain, dialog, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const https = require('https')
const csv = require('csv-parser')
const ejs = require('ejs');
const pdf = require('html-pdf');
const electronReload = require('electron-reload')

electronReload(__dirname)


function createSlug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
           .replace(/\s+/g, '-') // collapse whitespace and replace by -
           .replace(/-+/g, '-'); // collapse dashes

  return str;
}

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

ipcMain.on('test:msg',(e, option) => {

  // console.log(options)
  const dd = option.dd[1];
  const id = 1;
  const headers = option.dd[0];
  const data =  {
    data: dd,
    headers: headers,
    image_url: 'http://localhost:3000/public/logo.png',
  };

  const template = fs.readFileSync('template.ejs', 'utf-8');
  
  const html = ejs.render(template, data);

  // console.log(html)


  var EmployeName = dd._0
  EmployeName = createSlug(EmployeName)
  var pdfFileName = `${EmployeName}.pdf`

  const filePath = 'render.html';
  fs.writeFile(filePath, html, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`File "${filePath}" written successfully`);
    }
  });

  // const html = fs.readFileSync('views/slip2.hbs', 'utf8');
  const options = {
      format: 'Letter',
      border: {
        top: '1px',
        right: '1px',
        bottom: '1px',
        left: '1px'
      },
      footer: {
        height: '15mm',
        
      }
    };

  pdf.create(html, options).toFile(pdfFileName, (err, res) => {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
  });

})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})