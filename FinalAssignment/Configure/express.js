var path = require('path');
const expressConf = require("express");
const express = expressConf();
module.exports = function() {
    const app = express;
    require('../Routes/userRoutes.js')(app);
    app.use(expressConf.static(path.resolve('../Public/Resources')));
    return app
};
