"use strict"
var path = require('path');
const expressConf = require("express");
var fs = require('fs');
var http = require('http');
var https = require('https');
var session = require('express-session');
const express = expressConf();
var cookieParser = require('cookie-parser');
var httpsKey = fs.readFileSync('Encryption/domain.key');
var httpsCert = fs.readFileSync('Encryption/domain.crt');

var credentials = {key: httpsKey, cert: httpsCert};


module.exports = function(db) {
    // var https = require('https');
    const app = express;
    app.use(cookieParser());
    app.use(session({
        key: 'user_sid',
        secret: 'homiezzSecret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            //Without expires. client should delete cookie when closing web browser
            // /expires: 10000,
            //TODO: change this if we have https working
            secure: true
        }
    }));
    
    app.use(expressConf.static(__dirname + '/../Public/Resources/images'));
    require(path.resolve(__dirname + '/../Routes/userRoutes.js'))(app, db);
    var httpsServer = https.createServer(credentials, app);    
    var httpServer = http.createServer(app);

    return [httpsServer, httpServer];
};


