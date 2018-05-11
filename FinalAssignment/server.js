"use strict"

const sqlDB = require('./Configure/sqlDB.js');
//build new database at file loaction
const db = new sqlDB('./DB/testDB.db');

//get express config file and create app
const configureExpress = require('./Configure/express.js');
//pass db down to be used with routing
const app = configureExpress(db);

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
