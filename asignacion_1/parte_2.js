var express = require('express')
var app = express()


app.use(function(req, res, next) {
	req.rawBody = '';
	
	req.setEncoding('utf8');

	req.on('data', function(basura) {
		req.rawBody +=basura;
	});
	
	req.on('end', function() {
		next();
	}); 
});

app.post('/parte2', function (req, res) {

	console.log("header:" + req.rawHeaders);
	
	console.log("body:" + req.rawBody);

})

app.listen(8082, function () {
	console.log('listen 8082 port.')
})

