"use strict";
var crypto = require('crypto');


function getRandomString(length) {
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
};


function sha256(password, salt) {
    var hash = crypto.createHmac('sha256', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return [value, salt];
};

//hash password
module.exports.hash = function(userpassword) {
    var salt = getRandomString(16); /** Gives us salt of length 16 */
    var passwordData = sha256(userpassword, salt);
    var hashAndSalt = passwordData.join("$");
    console.log("hashed pass = " + hashAndSalt);
    return hashAndSalt;
}

module.exports.verify = function(incomingPass, storedHash) {
    var passwordData = storedHash.split('$');
    var newHash = sha256(incomingPass, passwordData[1]);
    return newHash[0] === passwordData[0];
}  