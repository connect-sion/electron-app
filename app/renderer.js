const io = require('socket.io-client');

const socket = io.connect('http://localhost:8080');

const peerConnections = {};
const audio = document.querySelector('audio');
const config = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] };

exports.getAudio = () => {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      audio.srcObject = stream;
      socket.emit('broadcaster');
    })
    .catch(console.error);

  socket.on('watcher', (id) => {
    const peerConnection = new RTCPeerConnection(config);
    peerConnections[id] = peerConnection;

    let stream = audio.srcObject;
    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidate', id, event.candidate);
      }
    };

    peerConnection
      .createOffer()
      .then((sdp) => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit('offer', id, peerConnection.localDescription);
      });
  });

  socket.on('answer', (id, description) => {
    if (description) peerConnections[id].setRemoteDescription(description);
  });

  socket.on('candidate', (id, candidate) => {
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  });

  socket.on('disconnectPeer', (id) => {
    peerConnections[id].close();
    delete peerConnections[id];
  });
};
