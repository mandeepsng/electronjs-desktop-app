const btn = document.getElementById('btn')
const filePathElement = document.getElementById('filePath')
const jsonOutput = document.getElementById('jsonOutput')

btn.addEventListener('click', async () => {
    const filePath = await window.electronAPI.openFile()
    // filePathElement.innerText = filePath
    const json = JSON.stringify(filePath, null, 2);
    // filePathElement.innerText = json
    // console.log(filePath[0])

    ipcRenderer.send('test:msg', {filePath}  )

    var namelist = [];

    filePath.forEach((value, index) => {

        if (index > 0) {
            // setTimeout(() => {


            
            



                namelist.push(value._0);
                // console.log(index, value._0);
                
                var h6 = document.createElement('h3');
                h6.setAttribute('id', index);

                var text = document.createTextNode(value._0);
                h6.appendChild(text);

                document.querySelector('#jsonOutput').appendChild(h6);

            // }, 2000); // Delay execution for 1 second (1000 milliseconds)

        }

      });
      
      
      
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

// action.addEventListener('click', async () => {


// })

// ipcRenderer.on('csv-data', (event, data) => {
//     console.log(data)
// })

// ipcRenderer.on('csv-data-end', (event) => {
// console.log('Finished reading CSV file')
// })