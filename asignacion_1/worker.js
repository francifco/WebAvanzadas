var express = require('express');
var app = express();
var redis = require('redis');

var configYalm = require('node-yaml-config');
var configRedis = configYalm.load('./redis.yml');
var configTinify = configYalm.load('./tinify.yml');

var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var mongoConfig = configYalm.load('./database.yml');

var tinify = require('tinify');
var jimp = require('jimp');

var redisClient = redis.createClient(configRedis.port, configRedis.host);
redisClient.auth(configRedis.authKey);
var redisSubsClient = redis.createClient(configRedis.port, configRedis.host);
redisSubsClient.auth(configRedis.authKey);

tinify.key = configTinify.key;
var resizeImage = null;

app.use(express.static('public'));
redisSubsClient.on('connect', function() {
    console.log('Redis Subscriber connected');
});

redisClient.on('connect', function() {
    console.log('Redis Publisher connected');
});

redisSubsClient.config('set', 'notify-keyspace-events', 'KEA');
redisSubsClient.subscribe('__keyevent@0__:set', 'franci:resizeImage');
redisSubsClient.on('message', function(channel, key) {
    redisClient.get('franci:resizeImage', function(err, reply) {
        if (err) {
            console.error('Error getting key from redis: ' + err);
        } else if (reply) {
            try {
                redisClient.del('franci:resizeImage');
                var fullPath = reply;
                var imageName = reply.split('/');
                imageName = imageName[2];
                var compressedImagePath = __dirname + "/generated/compressed_" + imageName;
                var smallImagePath = __dirname + "/generated/small_" + imageName;
                var mediumImagePath = __dirname + "/generated/medium_" + imageName;
                var largeImagePath = __dirname + "/generated/large_" + imageName;
                
                tinify.fromFile(__dirname + '/public/' + fullPath).toFile(compressedImagePath, function(err) {
                    if (err) {
                        console.error('Error creating compressed image: ' + err);
                    } else {
                        
                         mongoClient.connect(mongoConfig.conectionString, function(err, db) {
                            if (err) {
                                return console.error(err);
                            }
                            var collectionMovies = db.collection('movies');
                            collectionMovies.update({ image: fullPath }, { $set: { compressedImage: "/compressed_" + imageName } },
                                function(err, result) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log('Compressed image created.');
                                    }
                                    db.close();
                                });
                        });

                    }
                });
                
                jimp.read(__dirname + '/public/' + fullPath).then(function (lenna) {
                    lenna.resize(80, 120)        // resize
                    .quality(60)                 // set quality
                    .write(smallImagePath);      // save

                    mongoClient.connect(mongoConfig.conectionString, function(err, db) {
                            if (err) {
                                return console.error(err);
                            }
                            var collectionMovies = db.collection('movies');
                            collectionMovies.update({ image: fullPath }, { $set: { smallImage: "/small_" + imageName } },
                                function(err, result) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log('Small image created');
                                    }
                                    db.close();
                                });
                    });

                }).catch(function (err) {
                    console.error('Error creating small thumbnail image: ' + err);
                });

   
                jimp.read(__dirname + '/public/' + fullPath).then(function (lenna) {
                    lenna.resize(110, 170)        // resize
                    .quality(60)                  // set quality
                    .write(mediumImagePath);      // save

                    mongoClient.connect(mongoConfig.conectionString, function(err, db) {
                            if (err) {
                                return console.error(err);
                            }
                            var collectionMovies = db.collection('movies');
                            collectionMovies.update({ image: fullPath }, { $set: { mediumImage: "/medium_" + imageName } },
                                function(err, result) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log('Medium thumbnail image created');
                                    }
                                    db.close();
                                });
                    });

                }).catch(function (err) {
                    console.error('Error creating medium thumbnail image: ' + err);
                });

                jimp.read(__dirname + '/public/' + fullPath).then(function (lenna) {
                    lenna.resize(110, 170)       // resize
                    .quality(60)                 // set quality
                    .write(largeImagePath);      // save

                    mongoClient.connect(mongoConfig.conectionString, function(err, db) {
                            if (err) {
                                return console.error(err);
                            }
                            var collectionMovies = db.collection('movies');
                            collectionMovies.update({ image: fullPath }, { $set: { largeImage: "/large_" + imageName } },
                                function(err, result) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.log('Large thumbnail image created');
                                    }
                                    db.close();
                                });
                    });

                }).catch(function (err) {
                    console.error('Error creating large thumbnail image: ' + err);
                });
       
      
            } catch (err) {
                console.error('Error creating thumbnails images: ' + err);
            }
        }
    });
});