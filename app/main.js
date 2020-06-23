const { app, BrowserWindow } = require('electron');
const express = require('express');
const server = express();
var http = require('http').Server(server);
var io = require('socket.io')(http);

// signaling
let broadcaster;
io.on('connection', function (socket) {
  socket.on('broadcaster', function () {
    broadcaster = socket.id;
    console.log('broadcaster', broadcaster);
  });

  socket.on('viewer', function () {
    console.log('viewer', broadcaster, socket.id);
    socket.to(broadcaster).emit('viewer', socket.id);
  });

  socket.on('candidate', function (id, event) {
    console.log('candidate', id, socket.id);
    socket.to(id).emit('candidate', socket.id, event);
  });

  socket.on('offer', function (id, event) {
    console.log('offer', id, broadcaster);
    socket.to(id).emit('offer', broadcaster, event.sdp);
  });

  socket.on('answer', function (event) {
    console.log('answer', broadcaster, socket.id);
    socket.to(broadcaster).emit('answer', socket.id, event.sdp);
  });
});

// listener
http.listen(8080, function () {
  console.log('listening on 8080');
});

let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: { preload: `${__dirname}/preload.js` },
  });
  mainWindow.loadFile(`${__dirname}/index.html`);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.webContents.openDevTools();
  });
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('ready', createWindow);
app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
