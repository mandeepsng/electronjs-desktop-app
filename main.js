const { app, BrowserWindow, ipcMain, dialog, ipcRenderer, webContents, Menu, MenuItem  } = require('electron')
const path = require('path')
const fs = require('fs')
const https = require('https')
const csv = require('csv-parser')
const ejs = require('ejs');
const pdf = require('html-pdf');
const electronReload = require('electron-reload')

electronReload(__dirname)

let win;
let aboutWindow;

const menuTemplate = [  {    label: 'File',    submenu: [      { role: 'quit' }    ]
  },
  {
    label: 'About',
    click: () => {
      // Create a new window when "About" is clicked
      createAboutWindow()
    }
  }
]

const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)




function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true
    }
  })

  aboutWindow.loadFile('about.html')
}


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

  if (!canceled && filePaths.length > 0) {
    const selectedFilePath = filePaths[0];
    const directoryPath = path.dirname(selectedFilePath);
  
    // set full permissions to the directory where the file is located
    fs.chmodSync(directoryPath, '0777');
  }

  const results = await new Promise((resolve, reject) => {
    const filepath_new = filePaths[0];
    const stream = fs.createReadStream(filepath_new).pipe(csv({ headers: true }));

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


  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // add leading zero if necessary
  const day = String(date.getDate()).padStart(2, '0'); // add leading zero if necessary

  const folderName = `${year}-${month}-${day}`;
  const downloadDir = app.getPath('downloads');

  console.log(`Folder "${folderName}" created successfully in "${downloadDir}"`);
  
  fs.mkdir(`${downloadDir}/${folderName}`, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Folder "${folderName}" created successfully in "${downloadDir}"`);
    }
  });


  // console.log(results[0]);
  results.forEach((value, index) => {







  const dd = value;
  const id = 1;
  const headers = results[0];
  const data =  {
    data: dd,
    headers: headers,
    image_url: 'http://localhost:3000/public/logo.png',
  };

  const template_ejs = path.join(__dirname, 'template.ejs');

  const template = fs.readFileSync(template_ejs, 'utf-8');
  
  const html = ejs.render(template, data);

  // console.log(html)


  var EmployeName = dd._0
  EmployeName = createSlug(EmployeName)
  var pdfFileName = `${downloadDir}/${folderName}/${EmployeName}.pdf`
  // var pdfFileName = `${EmployeName}.pdf`



  // const filePath = 'render.html';
  // fs.writeFile(filePath, html, (err) => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     console.log(`File "${filePath}" written successfully`);
  //   }
  // });

  // Get the main window
  const mainWindow = BrowserWindow.getAllWindows()[0];

// Write the new contents to the file
const filePath = path.join(__dirname, 'render.html');
fs.writeFile(filePath, html, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`File "${filePath}" written successfully`);
    
    // Send a message to the renderer process to update the page
    mainWindow.webContents.send('update-page', html);
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




});

  return 'pdfFileName';
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

// About Window
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    width: 300,
    height: 300,
    title: 'About Electron',
  });

   aboutWindow.loadFile(path.join(__dirname, './about.html'));
}


function createWindow () {
  const win = new BrowserWindow({
    width: 300,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
    }
  })

  // open dev tools
  // win.webContents.openDevTools()

  win.loadFile('index.html')

  ipcMain.on('test:msg',(e, option) => {


    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // add leading zero if necessary
    const day = String(date.getDate()).padStart(2, '0'); // add leading zero if necessary

    const folderName = `${year}-${month}-${day}`;
    const downloadDir = app.getPath('downloads');

    console.log(`Folder "${folderName}" created successfully in "${downloadDir}"`);
    
    fs.mkdir(`${downloadDir}/${folderName}`, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Folder "${folderName}" created successfully in "${downloadDir}"`);
      }
    });



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
    var pdfFileName = `${downloadDir}/${folderName}/${EmployeName}.pdf`
  
    const filePath = 'render.html';
    fs.writeFile(filePath, html, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`File "${pdfFileName}" written successfully`);
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
  
  
    // render success messge on main window
    // e.sender.send('csv-data-end')
    // Send a response back to the renderer process
    e.reply('test:response', 'Response message');

    // win.webContents.send('pdf:done', {pdfFileName} )
    console.log('pdfFileName');
    return 'newwww';
  })

}

ipcMain.on('test:test', (event, option) => {
  // Do something with the `option` parameter

  // Send a response back to the renderer process
  event.reply('test:response', 'Response message');
});


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

ipcMain.handle('process-data2', (event, data) => {
  // Perform actions with data
  console.log('Data received:', data);
  // Return response to renderer.js
  return 'Data received successfully';
});

  // handle the process-data URL
  // ipcMain.handle('process-data', (event, data) => {
  //   // do something with the data
  //   console.log(data);

  //   // return a response
  //   return 'Data received';
  // });

  let counter = 0;

  ipcMain.on('increment-counter', (event) => {

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // add leading zero if necessary
    const day = String(date.getDate()).padStart(2, '0'); // add leading zero if necessary

    const folderName = `${year}-${month}-${day}`;
    // fs.mkdir(folderName, function(err) {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     console.log(`Folder '${folderName}' created successfully`);
    //   }
    // });
    // counter++;
    // console.log('increment-counter', counter)
    // event.reply('counter-updated', counter);

    const downloadDir = app.getPath('downloads');
    
    fs.mkdir(`${downloadDir}/${folderName}`, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`Folder "${folderName}" created successfully in "${downloadDir}"`);
      }
    });

  });
  
  ipcMain.on('reset-counter', (event) => {
    counter = 0;
    console.log('reset-counter', counter)

    event.reply('counter-updated', counter);
  });

  
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})