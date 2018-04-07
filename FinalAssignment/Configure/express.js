"use strict"
var path = require('path');
const expressConf = require("express");
const express = expressConf();


module.exports = function() {
    const app = express;
    app.use(expressConf.static(__dirname + '/../Public/Resources/images'));
    require(path.resolve(__dirname + '/../Routes/userRoutes.js'))(app);
    return app
};
