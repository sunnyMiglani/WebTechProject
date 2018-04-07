"use strict"
const configureExpress = require('./Configure/express.js');
const app = configureExpress();

app.listen(3000, function(){
    console.log('Example app listening on port 3000!');
});
