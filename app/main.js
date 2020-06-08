const { app, BrowserWindow } = require('electron');
const server = require('http').Server().listen(8080);
const io = require('socket.io')(server);

let mainWindow = null;

let broadcaster;
io.sockets.on('connection', (socket) => {
  socket.on('broadcaster', () => {
    broadcaster = socket.id;
    console.log(`Broadcaster: ${broadcaster}`);
    socket.broadcast.emit('broadcaster');
  });
  socket.on('watcher', () => {
    socket.to(broadcaster).emit('watcher', socket.id);
  });
  socket.on('disconnect', () => {
    socket.to(broadcaster).emit('disconnectPeer', socket.id);
  });

  socket.on('offer', (id, message) => {
    socket.to(id).emit('offer', socket.id, message);
  });
  socket.on('answer', (id, message) => {
    socket.to(id).emit('answer', socket.id, message);
  });
  socket.on('candidate', (id, message) => {
    socket.to(id).emit('candidate', socket.id, message);
  });
});

const createWindow = () => {
  mainWindow = new BrowserWindow({ show: false });
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
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', createWindow);
app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
