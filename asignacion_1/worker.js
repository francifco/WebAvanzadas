var express = require('express');
var app = express();
var redis = require('redis');
var sqlite = require('sqlite3');
var configYalm = require('node-yaml-config');
var configRedis = configYalm.load('./redis.yml');
var configSqlite = configYalm.load('./database.yml');
var configTinify = configYalm.load('./tinify.yml');
var tinify = require('tinify');
var jimp = require('jimp');
var redisClient = redis.createClient(configRedis.port, configRedis.host);
redisClient.auth(configRedis.authKey);
var redisSubsClient = redis.createClient(configRedis.port, configRedis.host);
redisSubsClient.auth(configRedis.authKey);
var database = new sqlite.Database(configSqlite.path, sqlite.OPEN_READWRITE);
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
                        database.serialize(function() {
                            var statement = database.prepare("UPDATE movies set compressedImage = (?) where image = (?)");
                            statement.run("/compressed_" + imageName, fullPath);
                            statement.finalize();
                        });
                        console.log('Compressed image created.');
                    }
                });
                
                jimp.read(__dirname + '/public/' + fullPath).then(function (lenna) {
                    lenna.resize(80, 120)        // resize
                    .quality(60)                 // set quality
                    .write(smallImagePath);      // save

                    database.serialize(function() {
                        var statement = database.prepare("UPDATE movies set smallImage = (?) where image = (?)");
                            statement.run("/small_" + imageName, fullPath);
                            statement.finalize();
                        });
                        console.log('Small thumbnail image created.');

                }).catch(function (err) {
                    console.error('Error creating small thumbnail image: ' + err);
                });

   
                jimp.read(__dirname + '/public/' + fullPath).then(function (lenna) {
                    lenna.resize(110, 170)        // resize
                    .quality(60)                  // set quality
                    .write(mediumImagePath);      // save

                    database.serialize(function() {
                        var statement = database.prepare("UPDATE movies set mediumImage = (?) where image = (?)");
                            statement.run("/medium_" + imageName, fullPath);
                            statement.finalize();
                        });
                        console.log('Medium thumbnail image created.');

                }).catch(function (err) {
                    console.error('Error creating medium thumbnail image: ' + err);
                });

                jimp.read(__dirname + '/public/' + fullPath).then(function (lenna) {
                    lenna.resize(110, 170)       // resize
                    .quality(60)                 // set quality
                    .write(largeImagePath);      // save

                    database.serialize(function() {
                        var statement = database.prepare("UPDATE movies set largeImage = (?) where image = (?)");
                            statement.run("/large_" + imageName, fullPath);
                            statement.finalize();
                        });
                    console.log('Large thumbnail image created.');

                }).catch(function (err) {
                    console.error('Error creating large thumbnail image: ' + err);
                });
       
      
            } catch (err) {
                console.error('Error creating thumbnails images: ' + err);
            }
        }
    });
});