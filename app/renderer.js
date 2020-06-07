const Peer = require('simple-peer');

const peer1 = new Peer({ initiator: true });

peer1.on('connect', () => {
  // wait for 'connect' event before using the data channel
  peer1.send('hey peer2, how is it going?');
});

function addMedia(stream) {
  peer1.addStream(stream);
}

exports.getAudio = () => {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then(addMedia)
    .catch(() => {});
};

/*
peer2.on('stream', (stream) => {
  const audio = document.querySelector('audio');
  if ('srcObject' in audio) {
    audio.srcObject = stream;
  } else {
    // for older browsers
    audio.src = window.URL.createObjectURL(stream);
  }
  audio.play();
});
*/
