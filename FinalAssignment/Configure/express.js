const express = require("express")();
module.exports = function() {
    const app = express

    require('../Routes/userRoutes.js')(app);
    return app
}
