const io = require('socket.io-client');

const socket = io.connect('http://localhost:3000');

const audio = document.querySelector('audio');
let rtcPeerConnections = {};
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

socket.on('viewer', function (viewer) {
  rtcPeerConnections[viewer] = new RTCPeerConnection(iceServers);

  const stream = audio.srcObject;
  stream
    .getTracks()
    .forEach((track) => rtcPeerConnections[viewer].addTrack(track, stream));

  rtcPeerConnections[viewer].onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('candidate', viewer, {
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      });
    }
  };

  rtcPeerConnections[viewer]
    .createOffer()
    .then((sessionDescription) => {
      rtcPeerConnections[viewer].setLocalDescription(sessionDescription);
      socket.emit('offer', viewer, { type: 'offer', sdp: sessionDescription });
    })
    .catch((error) => console.log(error));
});

socket.on('answer', function (viewerId, event) {
  const description = new RTCSessionDescription(event);
  rtcPeerConnections[viewerId].setRemoteDescription(description);
});

socket.on('candidate', function (id, event) {
  const candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  });
  rtcPeerConnections[id].addIceCandidate(candidate);
});

function getAudio() {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      audio.srcObject = stream;
      socket.emit('broadcaster');
    })
    .catch(console.error);
}

exports.getAudio = getAudio;
