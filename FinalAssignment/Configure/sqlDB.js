"use strict"
const sqlite3 = require('sqlite3').verbose();

class sqlDB {

    constructor(dbLocation) {
        this.dbLocation = dbLocation;
        this.setupDataBase();
    }

    //open database file for use
    openDB() {
        const db = new sqlite3.Database(this.dbLocation, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQlite database.');
        });
        return db;
    };

    //close database file after use
    closeDB(db) {
        db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    }

    setupDataBase() {
        var db = this.openDB();
        db.serialize(function() {
            //look for user and house table in database and create if not present
            db.run('CREATE TABLE IF NOT EXISTS HouseGroups(GroupID INTEGER PRIMARY KEY AUTOINCREMENT, HouseName TEXT UNIQUE NOT NULL)'); 
            db.run('CREATE TABLE IF NOT EXISTS users(Email TEXT NOT NULL, Pass TEXT NOT NULL, Fname TEXT NOT NULL,\
                    Lname TEXT NOT NULL, HouseID INTEGER NOT NULL, FOREIGN KEY (HouseID) REFERENCES HouseGroups(GroupID))');

            db.run('CREATE TABLE IF NOT EXISTS Shopping(HouseID INTEGER NOT NULL, ShoppingList TEXT,\
                    FOREIGN KEY (HouseID) REFERENCES HouseGroups(GroupID))');
            
            //Add global house position if not set already
            db.run('INSERT OR IGNORE INTO HouseGroups(HouseName) VALUES(?)', ['Global']);
        });
        this.closeDB(db);
    }

    //add a new house
    addHouseGroup(houseName, callback) {
        var db = this.openDB();
        db.serialize(function() {
            db.run('INSERT OR IGNORE INTO HouseGroups(HouseName) VALUES(?)', [houseName]); //FIXME: WIll not create houses with same name
            db.all('SELECT GroupID gid, HouseName houseName FROM HouseGroups WHERE HouseName = ?', [houseName], function(err, rows) {
                if(err) {
                    console.log(err.message);
                }
                else {
                    if(callback) {
                        callback(rows[0]);
                    }
                }
            });
        });
        this.closeDB(db);
    }

    //given a house name and a user to join the house
    joinHouseGroup(houseName, email, callback) {
        var db = this.openDB();
        db.all('SELECT GroupID gid, HouseName houseName FROM HouseGroups WHERE HouseName = ?', [houseName], function(err, retRow) {
            if (err) {
                console.log(err.message);
            }
            else if (retRow && retRow.length > 0) {
                db.run('UPDATE users SET HouseID= ? WHERE email = ?', [retRow[0].gid, email], function(err) {
                    if(err) {
                        console.log(err.message);
                    }
                    if(callback) {
                        callback(retRow);
                    }
                });
            }
            else {
                console.log("House not found");
                if(callback){
                    callback(undefined)
                }
            }
        });
        this.closeDB(db);
    }

    //add user to user table
    addUser(tableName, email, psw, Fname, Lname, callback) {
        var db = this.openDB();
        db.run('INSERT INTO users(Email, Pass, Fname, Lname, HouseID) VALUES(?, ?, ?, ?, ?)', [email, psw, Fname, Lname, 1], function(err) {
            if (err) {
                return console.log(err.message);
            }
            // get the last insert id
            console.log(`A row has been inserted with rowid ${this.lastID}`);
            if(callback) {
                callback();
            }
        });
        this.closeDB(db);
    }

    //Find user from user table
    getUserData(email, requirePass, callback){
        var db = this.openDB();
        var sqlQuery;
        if(requirePass){ sqlQuery = 'SELECT Email email, Pass pass, Fname fname, Lname lname, HouseID houseID FROM users WHERE Email = ?';}
        else{ sqlQuery = 'SELECT Email email, Fname fname, Lname lname, HouseID houseID FROM users WHERE Email = ?';}
        this.generalQueryHelper(db, sqlQuery, email, callback);
        this.closeDB(db);
    }


    getHouseIDFromUser(email, callback) {
        var db = this.openDB();
        let sqlQuery = 'SELECT HouseID houseID FROM users WHERE Email = ?';
        this.generalQueryHelper(db, sqlQuery, email, callback);
        this.closeDB(db)
    }

    getUsersFromHouseID(houseID, callback) {
        var db = this.openDB();
        let sqlQuery = 'SELECT Fname fname, Lname lname FROM users WHERE houseID = ?';
        this.generalQueryHelper(db, sqlQuery, houseID, callback);
        this.closeDB(db);
    }

    //////////////////////////// Shopping ///////////////////////////////////////////////////////

    addShoppingListToHouse(houseID, callback) {
        console.log("houseid"+ houseID);
        var db = this.openDB();
        db.run('INSERT INTO Shopping(HouseID, ShoppingList) VALUES(?,?)', [houseID, '[]'], function(err) {
            if(callback) {
                callback();
            }
        });
        this.closeDB(db);
    }

    getShoppingListByHouseID(houseID, callback) {
        var db = this.openDB();
        var sqlQuery = 'SELECT ShoppingList sl FROM Shopping WHERE HouseID = ?';
        this.generalQueryHelper(db, sqlQuery, houseID, callback);
        this.closeDB(db);
    }

    insertItemsToShoppingList(houseID, fname, item, callback) {
        var db = this.openDB();
        db.all('SELECT ShoppingList sl FROM Shopping WHERE HouseID = ?', [houseID], function(err, row) {
            if (err) {
                console.log(err.message);
            }
            else {
                //insert to alphabetical order
                var currentList = JSON.parse(row[0].sl);
                var index = 0;
                if(currentList.length == 0){ currentList.push([fname,item]);}
                else {
                    console.log(currentList[index]);
                    while( index < currentList.length && currentList[index][0] < fname) {
                        console.log("loop");
                        index++;
                    }
                    currentList.splice(index, 0, [fname,item])
                }
                db.run('UPDATE Shopping SET ShoppingList = ? WHERE HouseID = ?', [JSON.stringify(currentList), houseID], function(err) {
                    if(callback) {
                        callback();
                    }
                });
            }
        });
        this.closeDB(db);
    } 

    deleteItemFromShoppingList(houseID, item, callback) {
        var db = this.openDB();
        var sqlQuery = 'SELECT ShoppingList sl FROM Shopping WHERE HouseID = ?';
        this.generalQueryHelper(db, sqlQuery, houseID, function(rows) {
            var currentList = JSON.parse(row[0].sl);
            for(var i = 0; i < currentList.length; i++) {
                if(currentList[i][0] === item[0] && currentList[i][1] === item[1]) {
                    currentList.splice(i,1);
                    break;
                }
            }
            if(callback) {
                callback();
            }
        });
        this.closeDB(db);
    }

    //////////////////////////////// Bills /////////////////////////////////////////////////////

    createTableOfBills(HouseID) {
        var db = this.openDB();
        
        this.closeDB(db);
    }


    //////////////////////////////// Helper functions ///////////////////////////////////////////

    generalQueryHelper(db, sqlQuery, queryReq, callback) {
        db.all(sqlQuery, [queryReq], function (err, rows) {
            if (err) {
                console.log(err.message);
            }
            else {
                if (callback) {
                    callback(rows);
                }
            }
        });
    }


}


module.exports = sqlDB;