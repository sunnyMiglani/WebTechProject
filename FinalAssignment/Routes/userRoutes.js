"use strict"
const publicRes = __dirname + '/../Public/Resources/';
const publicPath = __dirname + '/../Public/';

module.exports = function(app, db) {
    var path = require('path');
    var bodyParser = require('body-parser');
    app.use(bodyParser.json()); // support json encoded bodies
    //app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

    /////////////////////////// html files ////////////////////////////////
    app.get('/', function(req, res) {
        res.sendFile(path.resolve(publicPath + 'home.html'));
    });

    app.get('/page2', function(req, res) {
        res.sendFile(path.resolve(publicPath + 'page2.html'));
    });

    app.get('/login', function(req, res) {
        res.sendFile(path.resolve(publicPath + 'login.html'));
    });

    ////////////////////////// css files //////////////////////////////////
    app.get('/home.css', function(req, res) {
        res.sendFile(path.resolve(publicRes + 'home.css'));
    });

    app.get('/login.css', function(req, res) {
        res.sendFile(path.resolve(publicRes + 'login.css'));
    });

    /////////////////////////// image files ///////////////////////////////
    app.get('avatar.png', function(req, res) {
        res.sendFile(path.resolve(publicRes + 'images/avatar.png'));
    });

    ///////////////////////////// js files ////////////////////////////////
    app.get('/Resources/home.js', function(req, res) {
        res.sendFile(path.resolve(publicRes + 'home.js'));
    });

    ////////////////////////// Database/login requests //////////////////////////
    app.post('/signup', function(req, res) {
        var uname = req.body.uname;
        var token = req.body.token;
        var geo = req.body.geo;
        console.log(uname + " " + token + " " + geo);
        res.send("signed up for site");
    })

    app.post('/signin', function(req, res) {
        var user_id = req.body.uname;
        var token = req.body.token;
        var geo = req.body.geo;
        console.log(user_id + " " + token + " " + geo);
        res.send("signed in to site");
    })
};