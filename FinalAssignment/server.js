"use strict"

var https = require('https');
const sqlDB = require('./Configure/sqlDB.js');
//build new database at file loaction
const db = new sqlDB('./DB/user_data.db');

//get express config file and create app
const configureExpress = require('./Configure/express.js');
//pass db down to be used with routing
const apps = configureExpress(db);

const httpsApp = apps[0];
const httpApp = apps[1];

httpsApp.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});

httpApp.listen(80, function() {
    console.log('Example app listening on port 80!');
});
