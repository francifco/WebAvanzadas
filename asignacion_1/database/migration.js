var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;
var yalmConfig = require('node-yaml-config');
var mongoConfig = yalmConfig.load('./database.yml');

mongoClient.connect(mongoConfig.conectionString, function(err, db) {
    if (err) {
        return console.error(err);
    }
    db.createCollection('movies', function(err, collection) {});
    return console.log('mongo database created.');
    db.close();
});