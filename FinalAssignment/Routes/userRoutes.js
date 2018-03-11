
var path = require('path');
module.exports = function(app){

    const publicPath = __dirname + '/../Public/';


    app.get('/', function(req, res){
        console.log(__dirname);
        res.sendFile(path.resolve(publicPath + 'home.html'));
    })
};
