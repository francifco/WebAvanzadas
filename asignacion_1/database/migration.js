var sqlite = require('sqlite3');
var configYalm = require('node-yaml-config');
var configSqlite = configYalm.load('./database.yml');
var db = new sqlite.Database(configSqlite.path);


db.serialize(function() {
    db.run("CREATE TABLE movies (id TEXT PRIMARY KEY, name TEXT, description TEXT, keywords TEXT, image TEXT)");
});

db.close();