var express = require('express');
var app = express();

app.all('*', function (req, res) {
  
	var fullHostName = req.get('host');
	var hostNameSplited = fullHostName.split(':'); 

	console.log("protocol: " + req.protocol);
	console.log("host: " + hostNameSplited[0]);
	console.log("port: " + hostNameSplited[1]);
	console.log("path: " + req.originalUrl);

});

app.listen(8082, function () {
	console.log('LISTENING ON PORT: 8082');
});










