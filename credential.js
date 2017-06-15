var fs = require('fs');

var Credential = function () {
    var fileContent = JSON.parse(fs.readFileSync('credential.json', 'utf8'));

    this.username = fileContent.username;
    this.password = fileContent.password;
};

module.exports = new Credential();