var camera = require('film')

//var controls = require('./controls')()

//document.body.appendChild(controls)
//console.log(controls)
var touchdown = require('touchdown')
var on = require('on-off')
var qr = require('qrcode-reader')
var ui = require('getids')()
var videoEl = ui.source//document.getElementById('source')
var film = ui.film //document.getElementById('film')
var mirror = ui.mirror//document.getElementById('mirror')

var getSources = require('./sources')//require('./getUserMedia.js')({audio: false, video: true})

var controller = null

var bjork, AV = {}

touchdown.start(ui.scanqr)

scanqr.addEventListener('liftoff', function start() {
  //var audioSource = ui.audioSelect.value;
  var videoSource = ui.videoinput.value;
  var constraints = {
    audio: false,
/*
    audio: !(Boolean(audioSource)) ? false : {
      optional: [{
        sourceId: audioSource
      }]
    },
*/
    video: {
        width: 1280,
        height: 720,
        sourceId: videoSource
    }
  };
  navigator.getUserMedia(constraints, onMediaStream, function(err){
    console.log(err)
  });
})


//mirror.style.display = 'none'
ui.display.removeChild(videoEl)

getSources(function(sources){
  for (var i = 0; i !== sources.length; ++i) {
    var sourceInfo = sources[i]
    var k
    if(!(AV[sourceInfo.kind])) AV[sourceInfo.kind] = []
    AV[sourceInfo.kind].push(sourceInfo)
    // .label and .id are the important props
  }
  for(av in AV){
    for(aov in AV[av]){
      var s = AV[av]
      var option = document.createElement('option');
      option.value = AV[av][aov].id
      option.text = AV[av][aov].label || av
      ui[av].appendChild(option)
    }
  }
})

function onMediaStream(stream){
    
    var video = videoEl.cloneNode(true)

    bjork = window.URL.createObjectURL(stream) 

    video.src = bjork

    video.onloadedmetadata = function(){
      console.log(this.videoWidth, this.videoHeight)
    }

    video.play()

    if(controller) {// source reboot
    
      display.removeChild(document.body.querySelector('#source')) 
      
      controller.emit('update', stream, video, mirror, film)

      on.off(snap, clickSnap)

    }

    controller = camera(stream, video, mirror, film)

    display.insertBefore(video, film)

    controller.on('expose', function(data){
        let qrr = new qr()
        qrr.callback = function(er, re){
          if(re) alert(JSON.stringify(re)) 
        }
        var q = qrr.decode(data)
        //var render = film.getContext('2d')
        //render.putImageData(data, 0, 0)
        //var url = film.toDataURL()
    })

    setInterval(controller.expose, 1000 / 24)
    //on(snap, 'click', clickSnap) 
    

/*
    setInterval(function(){
      controller.expose({shutterSpeed: 1000/16, filmSpeed:{
        r: 1,
        g: 1,
        b: 1 
      }})
    }, 1000/16)

    setInterval(function(){
//      controller.snapShot({shutterSpeed: 2000})
    }, 1000/16) 
*/  
}

function clickSnap (){
  controller.expose({shutterSpeed: 24, filmSpeed: 1.25})
}
