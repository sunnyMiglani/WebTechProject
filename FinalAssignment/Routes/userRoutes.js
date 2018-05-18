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
                jsonObj.cssFiles =['join_house.css'];
                jsonObj.dashView = ['partials/join_house.ejs'];
                if(returnedRow[0].houseID === 1) {
                    res.render('dashboard', jsonObj);
                }
                else {
                    //get shopping data
                    db.getHouseIDFromUser(email, function(row) {
                        var hid = row[0].houseID;
                        db.getShoppingListByHouseID(hid, function(sList) {
                            getFlatmates(email, function(houseMembers) {
                                var normalJSON = JSONForVariables(req, 1); 
                                normalJSON.dashView = ['partials/shopping.ejs', 'partials/house_members.ejs'];
                                normalJSON.cssFiles = ["shopping.css", "house_members.css"];
                                normalJSON.javaScriptFiles = ["shopping.js"];
                                normalJSON.shopping = JSON.parse(sList[0].sl);
                                normalJSON.houseMembers = houseMembers;
                                res.render('dashboard', normalJSON);
                            });
                        });
                    }); 
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
            var jsonObj = JSONForVariables(req,4);
            res.render('my_account', jsonObj);
        } else {
            console.log("Account: Not a session user"); 
            res.redirect('/');
        }
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

    app.get('/shopping.js', function (req, res) {
        res.sendFile(path.resolve(jsPath + 'shopping.js'));
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
                    if(returnedRow[0] !== undefined) {
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
                else if(hashPass.verify(psw,returnedRow[0].pass)) {
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

    app.post('/addItem', function(req, res) {
        var item = req.body.item;
        var email = req.session.user.email;
        db.getUserData(email, false, function(returnedRow) {
            db.insertItemsToShoppingList(returnedRow[0].houseID, returnedRow[0].fname, item, function() {
                console.log("Added new item");
                res.redirect('/dashboard');
            });
        });
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

    app.get('/logout', function(req,res) {
            if (req.session.user && req.cookies.user_sid) {
                console.log("Tried to Logout!! ");
                res.clearCookie('user_sid');
                res.redirect('/');
            } else {
                res.redirect('/');
            }
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
        var numberOfRights = 1;
        jsonObj.javaScriptFiles = [];
        if( !loggedIn || pageID == 0){
            /* If the person is NOT logged in, return just the Home / About */
            labels.push("Home","About");
            links.push('dashboard','about');
            activeField.push('active', 'inactive');

            jsonObj.labels = labels;
            jsonObj.links = links;
            jsonObj.activeField = activeField;
            jsonObj.numberOfRight = 1;
            
            
            return jsonObj;
        }
        labels.push("Home","About", "Logout", "My Account");
        links.push('dashboard', 'about', 'logout' ,'account');
        activeField.push('inactive', 'inactive','inactive', 'inactive');
        activeField[pageID-1] = 'active';

        jsonObj.labels = labels;
        jsonObj.links = links;
        jsonObj.activeField = activeField;
        jsonObj.numberOfRight = 2;
        return jsonObj;

    }

    function getFlatmates(email, callback) {
        db.getHouseIDFromUser(email, function(rows) {
            db.getUsersFromHouseID(rows[0].houseID, function(userRows) {
                if(callback) {
                    callback(userRows);
                }
            });
        })
    }
    
    ////////////////////////// Error handling ////////////////////////
    app.use(function (req, res, next) {
        res.status(404).sendFile(path.resolve(htmlPath + '404.html'));
    });
    
    


};

    


