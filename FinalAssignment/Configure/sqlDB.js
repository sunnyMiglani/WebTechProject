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
            //look for user table in database and create if not present
            db.run('CREATE TABLE IF NOT EXISTS users(Email TEXT NOT NULL, Pass TEXT NOT NULL, Fname TEXT NOT NULL, Lname TEXT NOT NULL)');
        });
        this.closeDB(db);
    }

    addUser(tableName, email, psw, Fname, Lname, callback) {
        var db = this.openDB();
        db.run('INSERT INTO users(Email, Pass, Fname, Lname) VALUES(?, ?, ?, ?)', [email, psw, Fname, Lname], function(err) {
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

    findUser(email, callback) {
        var db = this.openDB();
        let sqlQuery = 'SELECT Email email, Pass pass, Fname fname, Lname lname FROM users WHERE Email = ?';
        db.all(sqlQuery, [email], function(err, rows) {
            if(err) {
                console.log(err.message);
            }
            else {
                if(rows[0] !== undefined) {
                    console.log(`${rows[0].name} ${rows[0].pass}`);
                    if(callback) {
                        callback(rows[0]);
                    }
                }
                else {
                    console.log("User not found");
                    if(callback) {
                        callback(undefined);
                    }
                }
            }
        });
        this.closeDB(db);
    }
}

module.exports = sqlDB;