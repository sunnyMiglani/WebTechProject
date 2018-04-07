"use strict"
const publicRes = __dirname + '/../Public/Resources/';
const publicPath = __dirname + '/../Public/';

module.exports = function(app){
    var path = require('path');
    //html files
    app.get('/', function(req, res){
        res.sendFile(path.resolve(publicPath + 'home.html'));
    });

    app.get('/page2', function(req, res){
        res.sendFile(path.resolve(publicPath + 'page2.html'));
    });

    //css files
    app.get('/home.css', function(req, res) {
        res.sendFile(path.resolve(publicRes + 'home.css'));
    });

    //js files
    app.get('/Resources/home.js', function(req, res) {
        res.sendFile(path.resolve(publicRes + 'home.js'));
    });
};
