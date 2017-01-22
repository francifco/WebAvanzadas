var express = require('express');
var app = express();


app.all('*', function(req, res) {
	
	var hostName = req.get('host');
	var hostNameSplited = hostName.split(':'); 
	
	
	var headerArray = [];

	var headerJson = JSON.parse(JSON.stringify(req.headers));

	for( var value in headerJson)
	{
		headerArray.push(headerJson[value]);
	}

	var responseJson = {
		"method" : req.method,
        "host" : hostNameSplited[0],
        "port" : hostNameSplited[1],
        "path" : req.originalUrl,
        "header" : headerArray
        }

	res.send(responseJson);
});

app.listen(8082, function () {
	console.log('LISTENING ON PORT: 8082');
});