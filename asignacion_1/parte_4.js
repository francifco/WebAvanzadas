
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

var configYalm = require('node-yaml-config');
var configRedis = configYalm.load('./redis.yml');
var redisClient = redis.createClient(configRedis.port, configRedis.host);

var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var mongoConfig = configYalm.load('./database.yml');
const fileExtra = require('fs-extra');


app.use(express.static('public'));
app.use(express.static('generated'));

redisClient.auth(configRedis.authKey);

redisClient.on('connect', function () {
	console.log('Redis connected');
});

var validUUID = true;
var newFilePath = "";

/*wa_ass 1 - 3*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*wa_ass 4*/
var storageImage = multer.diskStorage({
	destination: function (req, file, cb) {
		var newDestination = '/public/images/';
		mkdirp(__dirname + newDestination, function (err) {
			cb(null, __dirname + newDestination);
		});
	},
	filename: function (req, file, cb) {
		var varFile = Date.now() + '_';
		newFilePath = "/images/" + varFile + file.originalname;
		cb(null, varFile + file.originalname);
	}
});

var upload = multer({
	dest: '/uploads/',
	storage: storageImage,
});


/*wa_ass 4*/
var handlebars = exphbs.create({
	defaultLayout: 'mainLayout'
});


app.get('/movies/create', function (req, res) {
	res.render('newMovie');
});

//add a new movie.
app.post('/movies/create', upload.single('image'), function (req, res, next) {

	var emptyInputs = {
		"emptyName": "",
		"introduceName": "",
		"emptyDescription": "",
		"introduceDescription": "",
		"emptyKeywords": "",
		"introduceKeywords": "",
		"emptyImage": "",
		"introduceImage": ""
	}

	if (req.body.name == "") {
		emptyInputs.emptyName = "has-error";
		emptyInputs.introduceName = "Introduce Name.";
	}

	if (req.body.description == "") {
		emptyInputs.emptyDescription = "has-error";
		emptyInputs.introduceDescription = "Introduce description.";
	}

	if (req.body.keywords == "") {
		emptyInputs.emptyKeywords = "has-error";
		emptyInputs.introduceKeyword = "Introduce some keywords.";
	}

	if (!req.file) {
		emptyInputs.emptyImage = "has-error";
		emptyInputs.introduceImage = "Please select an image.";
	}

	//if all inputs are not empty add movie to datebase.
	if (!emptyInputs.emptyName && !emptyInputs.emptyDescription
		&& !emptyInputs.emptyKeywords && !emptyInputs.emptyImage) {


		var movie = {
			name: req.body.name,
			description: req.body.description,
			keywords: req.body.keywords,
			image: newFilePath
		};

		mongoClient.connect(mongoConfig.conectionString, function (err, db) {
			if (err) {
				return console.error(err);
			}
			var collectionMovies = db.collection('movies');
			collectionMovies.insert(movie, function (err, result) {
				if (err) {
					console.error(err);
				} else {

					redisClient.set('franci:resizeImage', newFilePath);
				}
				db.close();
			});
		});


		res.redirect('/movies');

	} else {
		res.render('newMovie', emptyInputs);
	}

});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


//fecth list of all movies.
app.get('/movies/json', function (req, res) {
	res.status(200);
	res.set('Content-Type', 'application/json');

	mongoClient.connect(mongoConfig.conectionString, function (err, db) {
		if (err) {
			return console.error(err);
		}
		var collectionMovies = db.collection('movies');
		collectionMovies.find().toArray(function (err, result) {
			result.forEach(function (element) {
				element.keywords = element.keywords.split(',');
				element.image = "http://" + req.headers.host + element.image;
				if (!element.compressedImage) {
					element.compressedImage = "";
				}
				if (!element.smallImage) {
					element.smallImage = "";
				}
				if (!element.mediumImage) {
					element.mediumImage = "";
				}
				if (!element.largeImage) {
					element.largeImage = "";
				}
				element.compressedImage = "http://" + req.headers.host + element.compressedImage;
				element.smallImage = "http://" + req.headers.host + element.smallImage;
				element.mediumImage = "http://" + req.headers.host + element.mediumImage;
				element.largeImage = "http://" + req.headers.host + element.largeImage;
			}, this);
			res.send(result);
		})
		db.close();
	});
});


//fecth list of all movies.
app.get('/movies/list/json', function (req, res) {
	res.status(200);
	res.set('Content-Type', 'application/json');

	mongoClient.connect(mongoConfig.conectionString, function (err, db) {
		if (err) {
			return console.error(err);
		}
		var collectionMovies = db.collection('movies');
		collectionMovies.find().toArray(function (err, result) {
			result.forEach(function (element) {
				element.keywords = element.keywords.split(',');
				element.image = "http://" + req.headers.host + element.image;
				if (!element.compressedImage) {
					element.compressedImage = "";
				}
				if (!element.smallImage) {
					element.smallImage = "";
				}
				if (!element.mediumImage) {
					element.mediumImage = "";
				}
				if (!element.largeImage) {
					element.largeImage = "";
				}
				element.compressedImage = "http://" + req.headers.host + element.compressedImage;
				element.smallImage = "http://" + req.headers.host + element.smallImage;
				element.mediumImage = "http://" + req.headers.host + element.mediumImage;
				element.largeImage = "http://" + req.headers.host + element.largeImage;
			}, this);
			res.send(result);
		})
		db.close();
	});
});

/*wa_ass 5*/
app.get('/image', function (req, res) {

	var obj = '{"error": {"message":"no image defined", "code":"404" }}';
	res.status(404);
	res.send(JSON.parse(obj));

});


app.get(['/img/*', '/image/*'], function (req, res) {
	if (fileExtra.existsSync(__dirname + '/public/imagesTaked/' + req.params[0])) {
		res.status(200);
		res.sendFile(path.join(__dirname + '/public/imagesTaked/' + req.params[0]));
	} else {
		var obj = '{"error": {"message":"image no found, verify image name.", "code":"404" }}';
		res.status(404);
		res.send(JSON.parse(obj));
	}
});




app.post('/image', function (req, res, next) {

	var conType = req.headers['content-type'];
	var obj;

	if (typeof conType !== 'undefined') {

		if (conType.indexOf('multipart/form-data') !== 0) {
			obj = '{"error": {"message":"Content type most be: multipart/form-data.", "code":"400" }}';
			res.status(400);
		} else {

			if (req.files != null && req.files.image != null && req.files.image.file != null) {

				var image = req.files.image;

				var filename = '';
				var extension = '';

				if (image.filename.indexOf('.') != -1) {
					filename = image.filename.split('.');
					extension = filename[filename.length - 1];
				}

				fileExtra.rename(image.file, '/public/imagesTaked/' + image.filename);

				fileExtra.remove(image.file.split('image')[0], function (err) {

					if (err) console.log(err);

					else {
						obj = '{"error": {"message":"Image uploaded.", "code":"200" }}';
						res.status(200);
					}
				});
			}

		}

	} else {

		obj = '{"error": {"message":"Content type undefined.", "code":"400" }}';
		res.status(400);
	}

	res.send(JSON.parse(obj));
	
});

/*wa_ass 4*/
app.get(['/movies/details','/movies/id'], function (req, res) {

	var obj = '{"error": {"message":"id undefined", "code":"404" }}';
	res.status(404);
	res.send(JSON.parse(obj));

});

app.get('/movies/details/*', function (req, res) {

	var id = req.params[0];
	var strId = id.toString();

	if (strId.length < 24 || strId.length > 24) {
		var obj = '{"error": {"message":"id undefined", "code":"404" }}';
		res.status(404);
		res.send(JSON.parse(obj));

	} else {

		mongoClient.connect(mongoConfig.conectionString, function (err, db) {
			if (err) {
				return console.error(err);
			}
			var collectionMovies = db.collection('movies');

			var objectId = new mongo.ObjectID(id);

			collectionMovies.findOne({ _id: objectId }, function (err, row) {
				
				if (err) {
					var obj = '{"error": {"message":"id undefined", "code":"404" }}';
					res.status(404);
					res.send(JSON.parse(obj));
				} else {
					res.render('detailMovie', row);
					db.close();
				}
			});
		});

	}


});

app.get('/movies/list', function (req, res) {
	mongoClient.connect(mongoConfig.conectionString, function (err, db) {
		if (err) {
			return console.error(err);
		}

		var collectionMovies = db.collection('movies');
		collectionMovies.find().toArray(function (err, row) {
			row.forEach(function (element) {
				element.keywords = element.keywords.split(',');
			}, this);

			res.render('listMovies', {
				title: "List movies:",
				layoutTitle: "List movies:",
				movies: row
			});
			db.close();
		});
	});
});


app.get('/movies', function (req, res) {

	mongoClient.connect(mongoConfig.conectionString, function (err, db) {
		if (err) {
			return console.error(err);
		}
		var collectionMovies = db.collection('movies');
		collectionMovies.find().toArray(function (err, row) {
			row.forEach(function (element) {
				element.keywords = element.keywords.split(',');
			}, this);
			res.render('listMovies', {
				title: "List movies:",
				layoutTitle: "List movies:",
				movies: row
			});
			db.close();
		});
	});

});


/*wa_ass 1 - 3*/
app.get("/404", function (req, res) {
	res.status(404);
	res.send();
});

app.get("/protected", function (req, res) {
	res.status(401);
	res.send();
});

app.get("/error", function (req, res) {
	res.status(500);
	res.send();
});

app.all("/notimplemented", function (req, res) {

	var currentMethods = req.method;
	var methodsAllowed = ['GET', 'POST', 'PUT'];

	if (methodsAllowed.indexOf(currentMethods) >= 0) {
		res.status(200);
	} else {
		res.status(501);
	}

	res.set('Allow', methodsAllowed);
	res.send();

});


app.get("/login", function (req, res) {
	res.sendFile(__dirname + "/" + "form.html");
});


app.post("/login", function (req, res) {

	var respond = {
		"username": req.body.username,
		"password": req.body.password
	}

	res.status(200);
	res.type('application/json');
	res.send(respond);
});

///*****wa_ass 4******************** 


///*****wa_ass 3******************** 

app.all('*', function (req, res) {

	var hostName = req.get('host');
	var hostNameSplited = hostName.split(':');

	var headerArray = [];

	var headerJson = JSON.parse(JSON.stringify(req.headers));

	for (var value in headerJson) {
		headerArray.push(headerJson[value]);
	}

	var responseJson = {
		"method": req.method,
		"host": hostNameSplited[0],
		"port": hostNameSplited[1],
		"path": req.originalUrl,
		"header": headerArray
	}

	res.send(responseJson);
});


app.listen(8082, function () {
	console.log('LISTENING ON PORT: 8082');
});