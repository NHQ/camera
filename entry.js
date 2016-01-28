var camera = require('film')

//var controls = require('./controls')()
var userMediaStream = require('./sources')//require('./getUserMedia.js')({audio: false, video: true})

//document.body.appendChild(controls)
//console.log(controls)
var ui = require('getids')()
var videoEl = document.getElementById('source')
var film = document.getElementById('film')
var mirror = document.getElementById('mirror')
var on = require('on-off')

var controller = null

var bjork

//mirror.style.display = 'none'
ui.display.removeChild(videoEl)

userMediaStream.on('stream', function(stream){
    
    var video = videoEl.cloneNode(true)

    bjork = window.URL.createObjectURL(stream) 

    video.src = bjork

    video.play()

    if(controller) {// source reboot
    
      display.removeChild(document.body.querySelector('#source')) 
      
      controller.emit('update', stream, video, mirror, film)

      on.off(snap, clickSnap)

    }

    controller = camera(stream, video, mirror, film)

    display.insertBefore(video, film)

    controller.on('expose', function(data){
        var render = film.getContext('2d')
        render.putImageData(data, 0, 0)
        var url = film.toDataURL()
    })

    on(snap, 'click', clickSnap) 
    

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
})

function clickSnap (){
  controller.expose({shutterSpeed: 3000, filmSpeed: 60})
}
