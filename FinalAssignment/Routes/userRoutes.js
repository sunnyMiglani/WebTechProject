"use strict"
const publicRes = __dirname + '/../Public/Resources/';
const publicPath = __dirname + '/../Public/';
const htmlPath = publicRes + 'Html/';
const cssPath = __dirname + '/../Public/Resources/CSS/';
const jsPath = __dirname + '/../Public/Resources/Javascript/';


var path = require('path');
var bodyParser = require('body-parser');


module.exports = function(app, db, hashPass) {

    /////////////////////////// middleware ////////////////////////////////

    app.use(bodyParser.json()); // support json encoded bodies
    app.use(bodyParser.urlencoded({ extended: false }));
    app.set('view engine', 'ejs')
    app.use(function(req,res,next){
        if(req.secure){
            next();
        } else {
            res.redirect('https://' + req.headers.host + ':443' + req.url);
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
        res.render('home', JSONForVariables(req, 1));
    });

    app.get('/about', function (req, res) {  
        res.render('about',JSONForVariables(req,2));
    });

    app.get('/dashboard', function(req, res) {
        if (req.session.user && req.cookies.user_sid) {
            console.log("Dashboard: Is a session user");
            var email = req.session.user.email;
            db.getUserData(email, false, function(returnedRow) {
                //if user does not belong to a house
                var jsonObj = JSONForVariables(req, 1);
                jsonObj.dashView = 'partials/join_house.ejs'
                if(returnedRow.houseID === 1) {
                    res.render('dashboard', jsonObj);
                }
                else {
                    //get shopping data
                    db.getHouseIDFromUser(email, function(row) {
                        var hid = row.houseID;
                        db.getShoppingListByHouseID(hid, function(sList) {
                            console.log("Shopping list = " + JSON.stringify(sList.sl));
                            console.log(JSON.parse(sList.sl));
                            var normalJSON = JSONForVariables(req, 1); 
                            normalJSON.dashView = 'partials/shopping.ejs';
                            normalJSON.cssFile = "shopping.css";
                            normalJSON.shopping = JSON.parse(sList.sl);
                            res.render('dashboard', normalJSON);
                        });
                    }); 
                    //get bills data
                    //get messages?
                    //insert data to pages
                }
            });
        } 
        else {
            console.log("Dashboard: Not a session user");
            res.redirect('/');
        }
    });


    app.get('/account', function(req, res) {
        if (req.session.user && req.cookies.user_sid) {
            console.log("Account: Is a session user");
            res.render('my_account', JSONForVariables(req, 3));
        } else {
            console.log("Account: Not a session user"); 
            res.redirect('/');
        }
    });

    ////////////////////////// css files //////////////////////////////////
    app.get('/basicLayout.css', function(req, res) {
        res.sendFile(path.resolve(cssPath + 'basicLayout.css'));
    });

    app.get('/home.css', function(req, res) {
        res.sendFile(path.resolve(cssPath + 'home.css'));
    });

    app.get('/about.css', function (req, res) {
        res.sendFile(path.resolve(cssPath + 'about.css'));
    });

    app.get('/404.css', function (req, res) {
        res.sendFile(path.resolve(cssPath + '404.css'));
    });

    app.get('/my_account.css', function (req, res) {
        res.sendFile(path.resolve(cssPath + 'my_account.css'));
    }); 
    
    app.get('/join_house.css', function (req, res) {
        res.sendFile(path.resolve(cssPath + 'join_house.css'));
    });

    app.get('/shopping.css', function (req, res) {
        res.sendFile(path.resolve(cssPath + 'shopping.css'));
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
    app.get('/newhouses.jpg', function (req, res) {
        res.sendFile(path.resolve(publicRes + 'Images/newhouses.jpg'));
    });

    ///////////////////////////// js files ////////////////////////////////
    app.get('/Resources/home.js', function(req, res) {
        res.sendFile(path.resolve(jsPath + 'home.js'));
    });

    app.get('/Resources/dashboard.js', function(req, res) {
        res.sendFile(path.resolve(jsPath + 'dashboard.js'));
    });

    app.get('/my_account.js', function (req, res) {
        res.sendFile(path.resolve(jsPath + 'my_account.js'));
    });

    app.get('/login.js', function (req, res) {
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
                //salt and hash pass to save in Database
                var hash = hashPass.hash(pass);
                //get user data: false to not return password
                db.getUserData(email, false, function(returnedRow) {
                    if(returnedRow !== undefined) {
                        console.log("User email already exists");
                        res.redirect('/');
                    }
                    else {
                        db.addUser('users', email, hash, fname, lname, function() {
                            console.log("Signup: going to dashboard");
                            req.session.user = {email};
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
            //get user data: true to return password
            db.getUserData(email, true, function(returnedRow) {
                if(returnedRow === undefined) {
                    console.log("User not found");
                    res.redirect('/');
                }
                //hash pass and verify 
                else if(hashPass.verify(psw,returnedRow.pass)) {
                    console.log("User logged in");
                    req.session.user = {email};
                    res.redirect('/dashboard');
                }
                else {
                    console.log("Incorect password");
                    res.redirect('/');
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
            db.addShoppingListToHouse(row.gid, function() {
                joinGroup(houseName, email, req, res);
            });7
        });
    });

    app.post('/joinhouse', function(req, res) {
        var houseName = req.body.hname;
        console.log("Hname = " + houseName);
        var email = req.session.user.email;
        joinGroup(houseName, email, req, res);
    });


    app.get('/myaccountinfo', function(req,res) {
        var currentEmail = req.session.user.email;
        db.getUserData(currentEmail, false, function(returnedRow) {
            if(returnedRow == undefined){
                console.log("User not found!");
                res.redirect('/');
            }
            else{
                res.status(200);
                res.json(returnedRow);
            }    
        });
    });
    
    
    ////////////////////////// Helper Funtions //////////////////////
    function joinGroup(houseName, email, req, res) {
        db.joinHouseGroup(houseName, email, function() {
            res.redirect('/dashboard');
        });   
    }


    function JSONForVariables(req, pageID){
        var jsonObj = {};
        var loggedIn = (req.session.user && req.cookies.user_sid);
        var labels = [];
        var links = [];
        var activeField = [];
        if( !loggedIn || pageID == 0){
            /* If the person is NOT logged in, return just the Home / About */
            labels.push("Home","About");
            links.push('dashboard','about');
            activeField.push('active', 'inactive');

            jsonObj.labels = labels;
            jsonObj.links = links;
            jsonObj.activeField = activeField;
            
            return jsonObj;
        }
        labels.push("Home","About", "My Account");
        links.push('dashboard', 'about', 'account');
        activeField.push('inactive', 'inactive', 'inactive');
        activeField[pageID-1] = 'active';

        jsonObj.labels = labels;
        jsonObj.links = links;
        jsonObj.activeField = activeField;

        return jsonObj;

    }
    
    ////////////////////////// Error handling ////////////////////////
    app.use(function (req, res, next) {
        // res.status(404).sendFile(path.resolve(.... etc ))//send("Sorry that page doesn\'t exist");
        res.status(404).sendFile(path.resolve(htmlPath + '404.html'));
    });
    
    


};

    


