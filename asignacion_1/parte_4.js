
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

app.use(express.static('public'));
app.use(express.static('generated'));

redisClient.auth(configRedis.authKey);

redisClient.on('connect', function() {
    console.log('Redis connected');
});

var database = new sqlite.Database(configSqlite.path, sqlite.OPEN_READWRITE);
var validUUID = true;
var newFilePath = "";

/*wa_ass 1 - 3*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



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
    defaultLayout: 'mainLayout'
});


app.get('/movies/create', function (req, res) {
	res.render('newMovie');
});

//add a new movie.
app.post('/movies/create', upload.single('image'), function(req, res, next) {

	var newUUID = uuid();
	
	var emptyInputs = {
		"emptyName": "",
		"introduceName": "",
		"emptyDescription": "",
		"introduceDescription": "",
		"emptyKeywords":"",
		introduceKeywords: "",
		"emptyImage": "",
		"introduceImage": ""
	}

	if(req.body.name == "") {
		emptyInputs.emptyName = "has-error";
		emptyInputs.introduceName = "Introduce Name.";
	} 

	if(req.body.description == ""){
		emptyInputs.emptyDescription = "has-error";
		emptyInputs.introduceDescription = "Introduce description.";
	}

	if(req.body.keywords == ""){
		emptyInputs.emptyKeywords = "has-error";
		emptyInputs.introduceKeyword = "Introduce some keywords.";
	}

	if (!req.file) {
        emptyInputs.emptyImage = "has-error";
		emptyInputs.introduceImage = "Please select an image.";
    }

	//if all inputs are not empty add movie to datebase.
	if(!emptyInputs.emptyName && !emptyInputs.emptyDescription 
	&& !emptyInputs.emptyKeywords && !emptyInputs.emptyImage) {

		database.serialize(function() {
        
		while (!verifyUUID(newUUID)) {
            newUUID = uuid();
        }
			var statement = database.prepare("INSERT INTO movies (id, name, description, keywords, image) values (?,?,?,?,?)");
			statement.run(newUUID, req.body.name, req.body.description, req.body.keywords, newFilePath);
			statement.finalize();
    	});
		
		redisClient.set('franci:resizeImage', "/images/"+req.file.filename);
		res.redirect('/movies');

	} else {
		res.render('newMovie', emptyInputs);
	}

});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


//fecth list of all movies.
app.get('/movies/json', function(req, res) {
	database.serialize(function() {
        database.all("SELECT * FROM movies", function(err, row) {
            res.send(row);    
		});

	});
});


//fecth list of all movies.
app.get('/movies/list/json', function(req, res) {
	database.serialize(function() {
        database.all("SELECT * FROM movies", function(err, row) {
            res.send(row);    
		});

	});
});


app.get('/movies/details/:id', function(req, res) {
    database.serialize(function() {
        database.get("SELECT * FROM movies where id = (?)", req.param("id"), function(err, row) {
            res.render('detailMovie', row);
        });
    });
});

app.get('/movies/list', function(req, res) {
    database.serialize(function() {
        database.all("SELECT * FROM movies", function(err, row) {
            row.forEach(function(element) {
                element.keywords = element.keywords.split(',');
            }, this);
            res.render('listMovies', {
                title: "Movie App",
                layoutTitle: "List movies:",
                movies: row
            });
        });
    })
});


app.get('/movies', function(req, res) {
    database.serialize(function() {
        database.all("SELECT * FROM movies", function(err, row) {
            row.forEach(function(element) {
                element.keywords = element.keywords.split(',');
            }, this);
            res.render('listMovies', {
                title: "List movies:",
                layoutTitle: "List movies:",
                movies: row
            });
        });
    })
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