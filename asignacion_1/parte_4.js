var express = require('express');
var app = express();


app.all('*', function(req, res) {
	
	var hostName = req.get('host');
	var hostNameSplited = hostName.split(':'); 
	var header = JSON.stringify(req.headers);
	
	var arr = Object.keys(req.headers).map( function(h) { 
			return req.headers[h].toString(); 
		});

	var responseJson = {
		"method": req.method,
        "host": hostNameSplited[0],
        "port": hostNameSplited[1],
        "path": req.originalUrl,
        "header": JSON.stringify(arr)
        }

	res.send(responseJson);
});

app.listen(8082, function () {
	console.log('LISTENING ON PORT: 8082');
});