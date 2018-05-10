"use strict"
const sqlite3 = require('sqlite3').verbose();

class sqlDB {

    constructor(dbLocation) {
        this.dbLocation = dbLocation;
    }

    openDB() {
        const db = new sqlite3.Database(this.dbLocation, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQlite database.');
        });
        return db
    };

    closeDB(db) {
        db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    }

    insertTable(tableName) {
        const db = this.openDB();
        db.run('CREATE TABLE ' + tableName + ' (name text)');
        this.closeDB(db);
    }
}

module.exports = sqlDB;