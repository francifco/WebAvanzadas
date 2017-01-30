
/*wa_ass 1 - 3*/
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

/*wa_ass 4*/ 
var exphbs = require('express-handlebars');
var exphbs = require('express-handlebars');
var multer = require('multer')
var mkdirp = require('mkdirp');
var uuid = require('uuid-v4');
var redis = require('redis');
var sqlite = require('sqlite3');
var configYalm = require('node-yaml-config');
var configRedis = configYalm.load('./redis.yml');
var configSqlite = configYalm.load('./database.yml');
var redisClient = redis.createClient(configRedis.port, configRedis.host);

redisClient.on('connect', function() {
    console.log('Redis connected');
});

var database = new sqlite3.Database(sqliteConfig.path, sqlite3.OPEN_READWRITE);
var validUUID = true;
var newFilePath = "";

/*wa_ass 1 - 3*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/*wa_ass 4*/ 
var storageImage = multer.diskStorage({
    destination: function(req, file, cb) {
        var newDestination = '/public/images/';
        mkdirp(__dirname + newDestination, function(err) {
            cb(null, __dirname + newDestination);
        });
    },
    filename: function(req, file, cb) {
        var varFile = Date.now() + '_';
        newFilePath = "/images/" + varFile + file.originalname;
        cb(null, varFile + file.originalname);
    }
});

var upload = multer({
    dest: '/uploads/',
    storage: storageImage,
});

function verifyUUID(newUUID) {
    database.get("SELECT * FROM movies where id = (?)", newUUID, function(err, row) {
        if (row > 0) {
            validUUID = false;
        }
    });
    return validUUID;
}


var handlebars = exphbs.create({
    defaultLayout: 'main',
    partialsDir: [
        'views/partials/',
    ]
});

app.post('/movies/create', upload.single('image'), function(req, res, next) {

	var newUUID = uuid();
	
	var emptyInputs = {
		"emptyName": false,
		"nameFeetback": "Introduce a name.",
		"description": false,
		"descriptionFeetback": "Introduce a description.",
		"image": false,
		"imageFeetback": "Select a image.",
		"keyWords":false,
		"keyWordsFeetback": "Introduce some keyWords"
	}

	if(req.body.name == "") {
		emptyInputs.name = true;
	} 

	if(req.body.description == ""){
		emptyInputs.description = true;
	}

	if(req.body.keyWords == ""){
		emptyInputs.keyWords = true;
	}

	if (!req.file) {
        emptyInputs.image = true;
    }

	//if all inputs are not empty. 
	if(!emptyInputs.name && !emptyInputs.description 
	&& !emptyInputs.keyWords && emptyInputs.image) {

		

		alert("Movie was added.");
		res.redirect('/movies');

	} else {
		res.set(emptyInputs);
	}

});


/*wa_ass 1 - 3*/ 
app.get("/404", function(req, res) {
	res.status(404);
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

app.all("/notimplemented", function(req, res) {
	
	var currentMethods = req.method;
	var methodsAllowed = ['GET','POST','PUT'];
	
	if(methodsAllowed.indexOf(currentMethods) >= 0){
		res.status(200);
	} else {
		res.status(501);
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

///*****wa_ass 4******************** 






///*****wa_ass 3******************** 

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