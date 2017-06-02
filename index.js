var fs = require('fs')

module.exports = fs.readFileSync(__dirname + '/public/packed.html', 'base64')
