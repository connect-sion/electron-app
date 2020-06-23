//requires
const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const port = process.env.PORT || 3000;

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
http.listen(port || 3000, function () {
  console.log('listening on', port);
});
