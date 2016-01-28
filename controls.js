var fs = require('fs')

var controls = fs.readFileSync('./controls.html', 'utf8')
var css = fs.readFileSync('./controls.css', 'utf8')
var insert = require('insert-css')

module.exports = function(){

  insert(css)

  return ghost(controls)  

}

function ghost(html){
  var div = document.createElement('div')
  div.innerHTML = html
  return div.firstChild
}


