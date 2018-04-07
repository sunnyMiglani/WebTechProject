"use strict"
var path = require('path');
const expressConf = require("express");
const express = expressConf();


module.exports = function() {
    const app = express;
    require(path.resolve(__dirname + '/../Routes/userRoutes.js'))(app);
    return app
};
