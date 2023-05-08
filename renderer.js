const btn = document.getElementById('btn')
const filePathElement = document.getElementById('filePath')

btn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.openFile()
    // filePathElement.innerText = filePath
    const json = JSON.stringify(filePath, null, 2);
    filePathElement.innerText = json
    console.log(json)
    // ipcRenderer.send('read-csv', filePath)
    // const filePath = await window.electronAPI.openFile()

    // create file
    // const data = 'Hello, world!';
    // fs.writeFile('file.txt', data, (err) => {
    // if (err) {
    //     console.error(err);
    // } else {
    //     console.log('File written successfully!');
    // }
    // });

    // read csv file
    // const csvFileStream = fs.readFileSync(filePath).pipe(csv.parseStream);
    // csvFileStream.on('data', (data) => {
    // console.log(data);
    // });

})

// ipcRenderer.on('csv-data', (event, data) => {
//     console.log(data)
// })

// ipcRenderer.on('csv-data-end', (event) => {
// console.log('Finished reading CSV file')
// })