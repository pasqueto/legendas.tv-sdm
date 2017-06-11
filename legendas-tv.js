var request = require('request');

var legendasTv = function () {

    var _url = 'http://legendas.tv';
    var _movies = [];
    
    var Movie = (function () {
        var id = 0;

        return function (name, release, date, href) {
            this.id = ++id;
            this.name = name;
            this.release = release;
            this.date = date;
            this.href = href;
        };
    })();
    
    _movies.bluRay = function () {
        return this.filter(function (movie) {
            return (movie.release.search(/(BluRay)|(BDRip)|(BRRip)/gi) !== -1);
        });
    };

    _movies.get = function (id) {
        return this.filter(function (movie) {
            return movie.id == id;
        })[0];
    }

    var _stripTags = function (string) {
        return string.replace(/<.*?>/g, '');
    }

    var _fetchWeeklyHighlights = function (rawBody) {
        var regex = /<div class="item"><a href=(?:"|')([^"']*)".*?<span>([^<>]*)<\/span>.*?<div class="tooltip">(?:<p>([^<>]*)<\/p>)(?:<p>([^<>]*)<\/p>){2}/g;
        var m;

        while ((m = regex.exec(rawBody)) !== null)  {
             m = m.map(function (val) { return val.trim() });
            _movies.push(new Movie(m[2], m[3], m[4], m[1]));
        }
    };

    var _fetchSynopsis = function (id, callback) {
        var movie = _movies.get(id);

        if (movie.synopsis) return callback(movie);

        request(_url + movie.href, function (error, response, body) {
            if (error) throw error;
            
            var regex = /<div class="t1"[^>]*>\s{1,}<p>((?:.|\s)*?)<\/p>/g;
            var synopsis = _stripTags(regex.exec(body)[1]);
            
            for (var i in _movies) {
                if (_movies[i].id == id) {
                    _movies[i].synopsis = synopsis;
                    movie = _movies[i];
                    break;
                }
            }
            
            callback(movie);
        });
    };

    this.onSearchable = function (callback) {
        if (_movies.length) return callback(_movies);

        request(_url, function (error, response, body) {
            if (error) throw error;

            _fetchWeeklyHighlights(body);
            callback(_movies);
        });
    };

    this.onSynopsisReady = function (id, callback) {
        this.onSearchable(function () {
            _fetchSynopsis(id, callback);
        });
    };
};

module.exports = new legendasTv();