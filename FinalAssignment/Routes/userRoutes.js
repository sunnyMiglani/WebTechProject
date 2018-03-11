
const publicRes = __dirname + '/../Public/Resources/';

module.exports = function(app){
    var path = require('path');
    const publicPath = __dirname + '/../Public/';


    app.get('/', function(req, res){
        res.sendFile(path.resolve(publicPath + 'home.html'));
    });

    app.get('/Resources/home.js', function(req, res) {
        res.sendFile(path.resolve(publicRes + 'home.js'));
    });
};
