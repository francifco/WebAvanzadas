var sqlite = require('sqlite3');
var configYalm = require('node-yaml-config');
var configSqlite = configYalm.load('./database.yml');
var database = new sqlite.Database(configSqlite.path);

database.serialize(function() {
    database.run("CREATE TABLE movies (id TEXT PRIMARY KEY, name TEXT, description TEXT, keywords TEXT, image TEXT,"
    +"compressedImage TEXT, smallImage TEXT, mediumImage TEXT, largeImage TEXT)");
});

database.close();