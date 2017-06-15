var request = require('request');
var fs = require('fs');
var error = require('./error');
var credential = require('./credential');

var LegendasTv = function () {

  var _movies = [];
  var _fetchedAt;
  var _isLoggedIn;

  var Movie = (function () {
    var id = 0;

    return function (name, release, date, href) {
      this.id = ++id;
      this.name = name;
      this.release = release;
      this.date = date;
      this.href = href;
      this.filename = function () {
        return this.name.replace(/\s/g, '_').toLowerCase();
      }
    };
  })();

  var legendasTvRequest = request.defaults({
    baseUrl: 'http://legendas.tv',
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' },
    jar: true
  });

  _movies.bluRay = function () {
    return this.filter(function (movie) {
      return (movie.release.search(/(BluRay)|(BDRip)|(BRRip)/gi) !== -1);
    });
  };

  _movies.get = function (id) {
    var movie = this.filter(function (movie) {
      return movie.id == id;
    })[0];

    if (!movie) throw new error.MovieNotFound();
    return movie;
  }

  var _stripTags = function (string) {
    return string.replace(/<.*?>/g, '');
  };

  var _fetchWeeklyHighlights = function (rawBody) {
    var regex = /<div class="item"><a href=(?:["'])([^"']*)".*?<span>([^<>]*)<\/span>.*?<div class="tooltip">(?:<p>([^<>]*)<\/p>)(?:<p>([^<>]*)<\/p>){2}/g;
    var m;

    while ((m = regex.exec(rawBody)) !== null) {
      m = m.map(function (val) { return val.trim() });
      _movies.push(new Movie(m[2], m[3], m[4], m[1]));
    }

    regex = /<a[^>]*href="\/login"[^>]*>entrar<\/a>/gi;

    _isLoggedIn = !regex.test(rawBody);
    _fetchedAt = new Date();
  };

  var _fetchDownloadLink = function (movie, rawBody) {
    if (movie.download) return;
    if (!_isLoggedIn) return;

    var regex = /<button[^>]*window\.open\('([^,]+)'.*download<\/button>/gi;
    movie.download = regex.exec(rawBody)[1];
  };

  var _fetchSynopsis = function (movie, callback) {
    if (movie.synopsis) return callback(movie);

    legendasTvRequest(movie.href, function (err, response, body) {
      if (err) throw err;

      var regex = /<div class="t1"[^>]*>\s*<p>((?:.|\s)*?)<\/p>/g;
      var synopsis = _stripTags(regex.exec(body)[1]);

      var urlImdb, m;
      regex = /<a[^>]*href=["'](http:\/\/(?:www\.)imdb\.com\/title\/[^"']+)/;

      if (m = regex.exec(body)) {
        urlImdb = m[1];
      }

      _fetchDownloadLink(movie, body);

      _getImdbRate(urlImdb, function (rate) {
        movie.synopsis = synopsis;
        movie.rate = rate;

        callback(movie);
      });
    });
  };

  var _login = function (username, password, callback) {
    if (_isLoggedIn) return callback();

    legendasTvRequest({
      url: '/login',
      method: 'POST',
      formData: {
        'data[User][username]': username,
        'data[User][password]': password,
        'data[lembrar]': 'on'
      }
    }, function (err, response, body) {
      if (err) throw err;
      if (body) throw new error.InvalidCredential();

      _isLoggedIn = true;
      callback();
    });
  };

  var _getImdbRate = function (url, callback) {
    if (!url) return callback(null);

    request(url, function (err, response, body) {
      if (err) throw err;

      var regex = /<span itemprop="ratingValue">([^>]+)<\/span>/g;
      callback(regex.exec(body)[1]);
    });
  };

  var _downloadSubtitle = function (movie, callback) {
    var download = function () {
      var filename = movie.filename() + '.rar';

      legendasTvRequest(movie.download)
        .on(error, function (err) {
          throw err;
        })
        .on('response', function (response) {
          callback(filename);

        }).pipe(fs.createWriteStream('subtitles/' + filename));
    };

    if (!movie.download) {
      legendasTvRequest(movie.href, function (err, response, body) {
        if (err) throw err;

        _fetchDownloadLink(movie, body);
        download(movie.download);
      });
    } else {
      download(movie.download);
    }
  };

  this.onReady = function (callback) {
    if (_movies.length) return callback(_movies);

    legendasTvRequest('/', function (err, response, body) {
      if (err) throw err;

      _fetchWeeklyHighlights(body);
      callback(_movies);
    });
  };

  this.onFetchSynopsis = function (id, callback) {
    this.onReady(function () {
      _fetchSynopsis(_movies.get(id), callback);
    });
  };

  this.onDownloadSubtitle = function (id, callback) {
    this.onReady(function () {
      var movie = _movies.get(id);
      if (!_isLoggedIn) {
        console.log('\nlogin...');

        _login(credential.username, credential.password, function () {
          _downloadSubtitle(movie, callback);
        });
      } else {
        _downloadSubtitle(movie, callback);
      }
    });
  };

  this.isLoggedIn = function () {
    return _isLoggedIn;
  };

  this.fetchDate = function () {
    return _fetchedAt;
  };
};

module.exports = new LegendasTv();