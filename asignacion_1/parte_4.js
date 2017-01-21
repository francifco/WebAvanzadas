var express = require('express');
var app = express();


app.get('/parte4', function(req, res) {
	var hostArray = req.get('host').split(":");
	var header = JSON.stringify(req.headers);
	var responseJson = {
		"Method" : req.method,
		"Path" : req.path,
		"Port" : hostArray[1],
		"Headers": header
	}
	res.send(responseJson);
});

app.listen(8082, function(){
	console.log('listen 8082 port.');
})