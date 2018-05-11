"use strict"
const publicRes = __dirname + '/../Public/Resources/';
const publicPath = __dirname + '/../Public/';

var path = require('path');
var bodyParser = require('body-parser');


module.exports = function(app, db) {

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies


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
        if (!req.body) {
            res.sendStatus(400);
        }
        else {
            var uname = req.body.uname;
            var psw = req.body.psw;
            var repsw = req.body.repsw;
           
            db.addUser('users', uname, psw);
            res.send("Added user to site");
        }
    });

    app.post('/signin', function(req, res) {
        if (!req.body) {
            res.sendStatus(400);
        }
        //post request username and password
        var uname = req.body.uname;
        var psw = req.body.psw;
        db.findUser(uname, function(returnedPass) {
            if(returnedPass === psw) {
                res.send("signed in to site");
            }
            else {
                res.sendStatus(400);
            }
        });
    })
};