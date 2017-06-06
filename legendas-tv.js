var request = require('request');

var legendasTv = function () {

    var _movies = [];

    var Movie = function (name, release, date) {
        this.name = name;
        this.release = release;
        this.date = date;
    };

    _movies.bluRay = function () {
        return this.filter(function (movie) {
            return (movie.release.search(/(BluRay)|(BDRip)|(BRRip)/gi) !== -1);
        });
    };

    var _weeklyHighlights = function (rawBody) {
        var regex = /<div class="item">.*?<span>([^<>]*)<\/span>.*?<div class="tooltip">(?:<p>([^<>]*)<\/p>)(?:<p>([^<>]*)<\/p>){2}/g;
        
        var m;
        while ((m = regex.exec(rawBody)) !== null)  {
            _movies.push(new Movie(m[1].trim(), m[2].trim(), m[3].trim()));
        }
    };

    this.onSearchable = function (callback) {
        if (_movies.length) return callback(_movies);
        request('http://legendas.tv', function (error, response, body) {
            if (error) throw error;

            _weeklyHighlights(body);
            callback(_movies);
        });
    };
};

module.exports = new legendasTv();
