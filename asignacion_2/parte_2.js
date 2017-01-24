var express = require('express')
var app = express();


app.use(function(req, res, next) {
	
	req.rawBody = '';
	req.setEncoding('utf8');
	req.on('data', function(piece) {
		req.rawBody += piece;
	});
	
	req.on('end', function() {
		next();
	}); 
});

app.all('*', function (req, res) {

	console.log("header:" + "\n" + req.rawHeaders + "\n");
	console.log("body:" + "\n" + req.rawBody + "\n");

});

app.listen(8082, function () {
	console.log('LISTENING ON PORT: 8082')
});

