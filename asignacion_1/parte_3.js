var express = require('express');
var app = express();


app.all('*', function (req, res) {
	console.log("header: " + JSON.stringify(req.headers));
});

app.listen(8082, function () {
	console.log('LISTENING ON PORT: 8082');
});


