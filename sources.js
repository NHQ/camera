var em = require('events').EventEmitter
var om = new em
//var audioSelect = document.querySelector('select#audioSource');
var videoSelect = document.querySelector('select#videoSource');

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

module.exports = om

function gotSources(sourceInfos) {
  var audioSelections = 0
  var videoSelections = 0
  for (var i = 0; i !== sourceInfos.length; ++i) {
    var sourceInfo = sourceInfos[i];
    var option = document.createElement('option');
    option.value = sourceInfo.id;
    if (sourceInfo.kind === 'audioinput') {
      continue // no audio in baescam
      option.text = sourceInfo.label || 'microphone ' +
      ++audioSelections
      audioSelect.appendChild(option);
    } else if (sourceInfo.kind === 'videoinput') {
      option.text = sourceInfo.label || 'camera ' + (++videoSelections);
      ++videoSelections
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source: ', sourceInfo);
    }
  }
}

if (typeof MediaStreamTrack === 'undefined' ||
    typeof navigator.mediaDevices.enumerateDevices === 'undefined') {
  alert('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
} else {
  navigator.mediaDevices.enumerateDevices().then(gotSources)
}

function successCallback(stream) {
  om.emit('stream', stream)
}

function errorCallback(error) {
//  document.body.innerText = JSON.stringify(error)
  om.emit('error', error);
}

function start() {
//  var audioSource = audioSelect.value;
  var videoSource = videoSelect.value;
  var constraints = {
    audio: false,
/*
    audio: !(Boolean(audioSource)) ? false : {
      optional: [{
        sourceId: audioSource
      }]
    },
*/
    video: !(Boolean(videoSource)) ? true : {
        width: 1280,
        height: 720,
        sourceId: videoSource
    }
  };
  navigator.getUserMedia(constraints, successCallback, errorCallback);
}

//audioSelect.onchange = start;
videoSelect.onchange = start;

//start();

