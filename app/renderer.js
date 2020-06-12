const io = require('socket.io-client');
const Peer = require('simple-peer');

const socket = io.connect('http://localhost:8080');

const peerConnections = {};
const audio = document.querySelector('audio');

let broadcaster = new Peer({ initiator: true });
broadcaster.on('signal', (signal) => {
  socket.emit('signal', { signal, peerId: socket.id });
});

socket.on('peer', ({ peerId }) => {
  let peer = new Peer({ initiator: true });
  peerConnections[peerId] = peer;

  // peer signaling
  socket.on('signal', (data) => {
    if (data.peerId === peerId) {
      peer.signal(data.signal);
    }
  });
  peer.on('signal', (signal) => {
    socket.emit('signal', { signal, peerId });
  });

  peer.on('error', (error) => {
    console.error(error);
  });
});

exports.getAudio = () => {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      broadcaster.addStream(stream);
      console.log(stream);
      audio.srcObject = stream;
    })
    .catch(console.error);
};
