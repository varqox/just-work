const electron = require('electron')
const {app, BrowserWindow} = electron;
const Menu = electron.Menu
const path = require('path')
const url = require('url')
const debug = /--debug/.test(process.argv[2])

app.disableHardwareAcceleration(); // Prevents chromium from becoming buggy

// require('electron-reload')(__dirname, {
//   // electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
//   // hardResetMethod: 'exit',
//   ignored: /.*\.db.*/
// });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 460, height: 330})
  Menu.setApplicationMenu(Menu.buildFromTemplate([{
    label: 'Graph',
    click: function() {
      win = new BrowserWindow({width: 800, height: 300, menu: false});
      win.loadURL('file://' + path.join(__dirname, 'graph.html'))
      win.setMenu(null)
      // win.openDevTools()
      win.on('closed', function() { win = null })
    }
  }]))

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () { mainWindow = null })

  // // Launch fullscreen with DevTools open, usage: npm run debug
  // if (debug) {
  //   mainWindow.webContents.openDevTools()
  //   // mainWindow.maximize()
  //   require('devtron').install()
  // }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
