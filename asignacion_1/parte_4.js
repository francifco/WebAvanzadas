var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/404", function(req, res) {
	res.status(400);
	res.send();
});

app.get("/protected", function(req, res) {
	res.status(401);
	res.send();
});

app.get("/error", function(req, res) {
	res.status(500);
	res.send();
});

app.get("/error", function(req, res) {
	res.status(500);
	res.send();
});

app.all("/notimplemented", function(req, res) {
	
	var currentMethods = req.method;
	var methodsAllowed = ["GET","POST","PUT"];
	
	if(methodsAllowed.indexOf(currentMethods) >= 0){
		res.status(200);
		res.send();
	} else {
		res.status(501);
		res.send();
	}
	
	res.set('Allow', methodsAllowed);
	res.send();

});


app.get("/login", function (req, res) {
   res.sendFile(__dirname + "/" + "form.html" );
});


app.post("/login", function (req, res) {
   
	var respond = {
		"username" : req.body.username,
		"password" : req.body.password
	} 
	
	res.status(200);
	res.type('application/json');
	res.send(respond);
});







app.listen(8082, function () {
	console.log('LISTENING ON PORT: 8082');
});