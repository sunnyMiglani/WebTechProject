
const publicRes = __dirname + '/../Public/Resources/';
const publicPath = __dirname + '/../Public/';

module.exports = function(app){
    var path = require('path');
    


    app.get('/', function(req, res){
        res.sendFile(path.resolve(publicPath + 'home.html'));
    });

    app.get('/Resources/home.js', function(req, res) {
        res.sendFile(path.resolve(publicRes + 'home.js'));
    });
};
