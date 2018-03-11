
module.exports = function(app){

    const publicPath = '../Public/';


    app.get('/', function(req, res){
        res.sendFile(publicPath + 'home.html');
    })
};
