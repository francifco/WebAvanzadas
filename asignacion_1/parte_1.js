var express = require('express')
var app = express()

app.get('/', function (req, res) {
  

var host = req.get('host');
var res = host.split(":"); 

console.log(req.protocol)
console.log(res[0])
console.log(res[1])
console.log(req.path)

})

app.listen(8082, function () {
  

console.log('listen 8082 port.')

})










