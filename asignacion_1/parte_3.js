var express = require('express')
var app = express()


app.post('/parte3', function (req, res) {
	console.log(JSON.stringify(req.headers));
})

app.listen(8082, function () {
	console.log('listen 8082 port.')
})

