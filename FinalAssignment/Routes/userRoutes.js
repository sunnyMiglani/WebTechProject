"use strict"
const publicRes = __dirname + '/../Public/Resources/';
const publicPath = __dirname + '/../Public/';
const cssPath = __dirname + '/../Public/Resources/CSS/';
const jsPath = __dirname + '/../Public/Resources/Javascript/';

var path = require('path');
var bodyParser = require('body-parser');


module.exports = function(app, db) {

    /////////////////////////// middleware ////////////////////////////////

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: false }));


    app.use(function(req, res, next) {
        if (req.cookies.user_sid && !req.session.user) {
            res.clearCookie('user_sid');
        }
        next();
    });

    var sessionChecker = function(req, res, next) {
        if (req.session.user && req.cookies.user_sid) {
            res.redirect('/dashboard');
        } else {
            next();
        }
    };

    /////////////////////////// html files ////////////////////////////////
    app.get('/', sessionChecker, function(req, res) {
        res.sendFile(path.resolve(publicPath + 'home.html'));
    });

    app.get('/page2', function(req, res) {
        res.sendFile(path.resolve(publicPath + 'page2.html'));
    });

    app.get('/login', sessionChecker, function(req, res) {
        res.sendFile(path.resolve(publicPath + 'login.html'));
    });

    app.get('/dashboard', function(req, res) {
        console.log(req.session.user);
        console.log(req.session.user_sid);
        if (req.session.user && req.cookies.user_sid) {
            console.log("Dashboard: Is a session user");
            res.sendFile(path.resolve(publicPath + 'dashboard.html'));
        } else {
            console.log("Dashboard: Not a session user");
            res.redirect('/login');
        }
    });

    app.get('/account', function(req, res) {
        if (req.session.user && req.cookies.user_sid) {
            console.log("Account: Is a session user");
            res.sendFile(path.resolve(publicPath + 'account.html'));
        } else {
            console.log("Account: Not a session user");
            res.redirect('/login');
        }
    });

    ////////////////////////// css files //////////////////////////////////
    app.get('/basicLayout.css', function(req, res) {
        res.sendFile(path.resolve(cssPath + 'basicLayout.css'));
    });

    app.get('/home.css', function(req, res) {
        res.sendFile(path.resolve(cssPath + 'home.css'));
    });

    app.get('/login.css', function(req, res) {
        res.sendFile(path.resolve(cssPath + 'login.css'));
    });

    /////////////////////////// image files ///////////////////////////////
    app.get('avatar.png', function(req, res) {
        res.sendFile(path.resolve(publicRes + 'images/avatar.png'));
    });

    ///////////////////////////// js files ////////////////////////////////
    app.get('/Resources/home.js', function(req, res) {
        res.sendFile(path.resolve(jsPath + 'home.js'));
    });

    app.get('/login.js', function(req, res) {
        res.sendFile(path.resolve(jsPath + 'login.js'));
    });


    ////////////////////////// Database/login requests ////////////////////
    app.post('/signup', function(req, res) {
        if (!req.body) {
            res.sendStatus(400);
        }
        else {
            //TODO: check pass' are same here or on client
            var name = req.body.uname;
            var pass = req.body.psw;
            var repsw = req.body.repsw;
            db.findUser(name, function(returnedRow) {
                if(returnedRow !== undefined) {
                    res.redirect('/login');
                }
                else {
                    db.addUser('users', name, pass, function() {
                        console.log("Signup: going to dashboard");
                        req.session.user = {name, pass};
                        res.redirect('/dashboard');
                    });
                }
            });
        }
    });

    app.post('/signin', function(req, res) {
        if (!req.body) {
            res.sendStatus(400);
        }
        //post request username and password
        else {
            var uname = req.body.uname;
            var psw = req.body.psw;
            db.findUser(uname, function(returnedRow) {
                if(returnedRow.pass === psw) {
                    console.log("User logged in");
                    req.session.user = returnedRow;
                    res.redirect('/dashboard');
                }
                else {
                    res.sendStatus(400);
                }
            });
        }
    });

    ////////////////////////// Error handling ////////////////////////
    app.use(function (req, res, next) {
        res.status(404).send("Sorry that page doesn\'t exist");
    })
};
