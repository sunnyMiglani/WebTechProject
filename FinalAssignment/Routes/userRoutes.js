"use strict"
const publicRes = __dirname + '/../Public/Resources/';
const publicPath = __dirname + '/../Public/';
const htmlPath = publicRes + 'Html/';
const cssPath = __dirname + '/../Public/Resources/CSS/';
const jsPath = __dirname + '/../Public/Resources/Javascript/';

var path = require('path');
var bodyParser = require('body-parser');


module.exports = function(app, db) {

    /////////////////////////// middleware ////////////////////////////////

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(function(req,res,next){
        if(req.secure){
            next();
        } else {
            res.redirect('https://' + req.headers.host + ':3000' + req.url);
        }
    });

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
        res.sendFile(path.resolve(htmlPath + 'home.html'));
    });

    app.get('/page2', function(req, res) {
        res.sendFile(path.resolve(htmlPath + 'page2.html'));
    });

    app.get('/login', sessionChecker, function(req, res) {
        res.sendFile(path.resolve(htmlPath + 'login.html'));
    });

    app.get('/dashboardBody', function(req, res) {                  //TODO: finish to generate the dynamic stuff
        res.sendFile(path.resolve(htmlPath + 'join_house.html'));
    });

    app.get('/dashboard', function(req, res) {
        console.log(req.session.user);
        console.log(req.session.user_sid);
        if (req.session.user && req.cookies.user_sid) {
            console.log("Dashboard: Is a session user");
            res.sendFile(path.resolve(htmlPath + 'dashboard.html'));
        } else {
            console.log("Dashboard: Not a session user");
            res.redirect('/login');
        }
    });

    app.get('/account', function(req, res) {
        if (req.session.user && req.cookies.user_sid) {
            console.log("Account: Is a session user");
            res.sendFile(path.resolve(htmlPath + 'account.html'));
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
    app.get('/404.css', function (req, res) {
        res.sendFile(path.resolve(cssPath + '404.css'));
    });

    /////////////////////////// image files ///////////////////////////////
    app.get('/avatar.png', function(req, res) {
        res.sendFile(path.resolve(publicRes + 'Images/avatar.png'));
    });
    app.get('/horsie.jpg', function (req, res) {
        res.sendFile(path.resolve(publicRes + 'Images/horsie.jpg'));
    });

    app.get('/houses.jpg', function (req, res) {
        res.sendFile(path.resolve(publicRes + 'Images/houses.jpg'));
    });
    app.get('/carie.jpg', function (req, res) {
        res.sendFile(path.resolve(publicRes + 'Images/carie.jpg'));
    });
    app.get('/404.png', function (req, res) {
        res.sendFile(path.resolve(publicRes + 'Images/houseEdited.png'));
    });

    ///////////////////////////// js files ////////////////////////////////
    app.get('/Resources/home.js', function(req, res) {
        res.sendFile(path.resolve(jsPath + 'home.js'));
    });

    app.get('/Resources/dashboard.js', function(req, res) {
        res.sendFile(path.resolve(jsPath + 'dashboard.js'));
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
            var email = req.body.email;
            var pass  = req.body.psw;
            var repsw = req.body.repsw;
            var fname = req.body.fname;
            var lname = req.body.lname;
            if(pass === repsw) {
                db.findUser(email, function(returnedRow) {
                    if(returnedRow !== undefined) {
                        console.log("User email already exists");
                        res.redirect('/login');
                    }
                    else {
                        db.addUser('users', email, pass, fname, lname, function() {
                            console.log("Signup: going to dashboard");
                            req.session.user = {email, pass, fname, lname};
                            res.redirect('/dashboard');
                        });
                    }
                });
            }
            else {
                console.log("Both passwords sent are not equal");
                res.redirect('/dashboard');
            }
        }
    });

    app.post('/signin', function(req, res) {
        if (!req.body) {
            res.sendStatus(400);
        }
        //post request username and password
        else {
            var email = req.body.uname; //TODO: change to body.email for consistency
            console.log(email);
            var psw = req.body.psw;
            db.findUser(email, function(returnedRow) {
                if(returnedRow === undefined) {
                    console.log("User not found");
                    res.redirect('/login');
                }
                else if(returnedRow.pass === psw) {
                    console.log("User logged in");
                    req.session.user = returnedRow;
                    res.redirect('/dashboard');
                }
                else {
                    console.log("Incorect password");
                    res.redirect('/login');
                }
            });
        }
    });


    app.post('/createhouse', function(req, res) {
        if (!req.body) {
            res.sendStatus(400);
        }
        var houseName = req.body.hname;
        var email = req.session.user.email;
        db.addHouseGroup(houseName, function(row) {
            console.log("New house = " + JSON.stringify(row));
            joinGroup(houseName, email, req, res);
        });
    });

    app.post('/joinhouse', function(req, res) {
        var houseName = req.body.hname;
        console.log("Hname = " + houseName);
        var email = req.session.user.email;
        joinGroup(houseName, email, req, res);
    });

    app.post('/joinuser', function(req, res) {

    });

    ////////////////////////// Helper callback funtions /////////////// TODO: maybe move these to a more appropriate file

    function joinGroup(houseName, email, req, res) {
        db.joinHouseGroup(houseName, email, function() {
            db.findUser(email, function(row) {
                if(row !== undefined) {
                    console.log("New row for user = " + JSON.stringify(row));
                    req.session.user = row;
                    res.redirect('/dashboard');
                }
                else {
                    console.log("Error: added user to house, but user was not found again");
                    res.redirect('/dashboard');
                }
            });   
        });   
    }

    ////////////////////////// Error handling ////////////////////////
    app.use(function (req, res, next) {
        // res.status(404).sendFile(path.resolve(.... etc ))//send("Sorry that page doesn\'t exist");
        res.status(404).sendFile(path.resolve(htmlPath + '404.html'));
    });
};
