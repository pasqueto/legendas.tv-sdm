var request = require('request');
var fs = require('fs');
var error = require('./error');
var credential = require('./credential');

var LegendasTv = function () {

  var _movies = [];
  var _isLoggedIn = false;
  var _fetchedAt;

  var Movie = function (id, title, release, date, href, episode) {
    this.id = id;
    this.title = title;
    this.release = release;
    this.date = date;
    this.href = href;
    this.filename = function () {
      var ep = '';
      if (this.episode) ep = '-' + this.episode;

      return this.title
        .replace(/[\s:\\\/?*"<>|]/g, '_')
        .toLowerCase() + ep.toLowerCase();
    };
    if (episode) this.episode = episode;
  };

  var legendasTvRequest = request.defaults({
    baseUrl: 'http://legendas.tv',
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36' },
    jar: true
  });

  _movies.bluRay = function () {
    return this.filter((movie) => {
      return (movie.release.search(/(BluRay)|(BDRip)|(BRRip)/gi) !== -1);
    });
  };

  _movies.get = function (id) {
    var movie = this.filter((movie) => {
      return movie.id == id;
    })[0];

    if (!movie) throw new error.MovieNotFound();
    return movie;
  }

  _movies.find = function (title, episode) {
    return this.filter((movie) => {
      if (title.trim().toLowerCase() === movie.title.toLowerCase()) {

        if (movie.episode) movie.episode = movie.episode.toLowerCase();
        if (episode) {
          episode = episode.trim().toLowerCase();
          return episode === movie.episode;
        }
        return true;
      }
      return false;
    });
  };

  var _stripTags = function (string) {
    return string.replace(/<.*?>/g, '');
  };

  var _fetchWeeklyHighlights = function (rawBody) {
    var regex = /<div class="item"><a href="(\/download\/([^\/]+)\/[^"]*)"[^>]*>(?:<span class="selo_temp">([^<>]*)<\/span>)?.*?<span>([^<>]*)<\/span>.*?<div class="tooltip">(?:<p>([^<>]*)<\/p>)(?:<p>([^<>]*)<\/p>){2}/g;
    var m;

    while ((m = regex.exec(rawBody)) !== null) {
      m = m.map((val) => { return val ? val.trim() : val; });

      if (_movies.some((movie) => { return movie.id === m[2]; })) continue;

      _movies.push(new Movie(m[2], m[4], m[5], m[6], m[1], m[3]));
    }

    _fetchedAt = new Date();
  };

  var _fetchSearchResult = function (rawBody) {
    var regex = /<div[^>]*>.*?<a href="(\/download\/([^\/]+)\/([^\/]+)\/[^"]+)">(.*?)<\/a>.*?em\s(.*?)<\/p>/g;
    var m;

    while ((m = regex.exec(rawBody)) !== null) {
      m = m.map((val) => { return val.trim(); });
      if (_movies.some((movie) => { return movie.id === m[2]; })) continue;

      var episode = /s\d{2}e\d{2}/gi.exec(m[3]);
      if (episode) episode = episode[0];

      _movies.push(new Movie(m[2], m[3].replace(/_/g, ' '), m[4], m[5], m[1], episode));
    }

    _fetchedAt = new Date();
  };

  var _fetchDownloadLink = function (movie, rawBody) {
    if (!_isLoggedIn) return;

    var regex = /<button[^>]*window\.open\('([^,]+)'.*download<\/button>/gi;
    movie.download = regex.exec(rawBody)[1];
  };

  var _fetchSynopsis = function (movie) {
    return new Promise((resolve, reject) => {
      if (movie.synopsis) return resolve(movie);

      legendasTvRequest(movie.href, (err, response, body) => {
        if (err) reject(err);

        var regex = /<div class="t1"[^>]*>\s*<p>((?:.|\s)*?)<\/p>/g;
        var synopsis = _stripTags(regex.exec(body)[1]);

        var urlImdb, m;
        regex = /<a[^>]*href=["'](http:\/\/(?:www\.)imdb\.com\/title\/[^"']+)/;

        if (m = regex.exec(body)) {
          urlImdb = m[1];
        }

        _fetchDownloadLink(movie, body);

        _getImdbRate(urlImdb, (rate) => {
          movie.synopsis = synopsis;
          movie.rate = rate;

          resolve(movie);
        });
      });
    });
  };

  var _login = function (username, password) {
    return new Promise((resolve, reject) => {
      if (_isLoggedIn) resolve();

      console.log('(login)...');
      legendasTvRequest({
        url: '/login',
        method: 'POST',
        formData: {
          'data[User][username]': username,
          'data[User][password]': password,
          'data[lembrar]': 'on'
        }
      }, (err, response, body) => {
        if (err) reject(err);
        if (body) reject(new error.InvalidCredential());

        _isLoggedIn = true;
        resolve();
      });
    });
  };

  var _getImdbRate = function (url, callback) {
    if (!url) return callback(null);

    request(url, (err, response, body) => {
      if (err) throw err;

      var regex = /<span itemprop="ratingValue">([^>]+)<\/span>/g;
      callback(regex.exec(body)[1]);
    });
  };

  var _downloadSubtitle = function (movie) {

    var download = function () {
      return new Promise((resolve, reject) => {
        var filename = movie.filename() + '.rar';
        legendasTvRequest(movie.download)
          .on('error', (err) => {
            reject(err);
          })
          .on('response', (response) => {
            resolve(filename);
          }).pipe(fs.createWriteStream('subtitles/' + filename));
      });
    };

    var fetchLink = function () {
      return new Promise((resolve, reject) => {
        if (movie.download) resolve();

        legendasTvRequest(movie.href, (err, response, body) => {
          if (err) reject(err);

          _fetchDownloadLink(movie, body);
          resolve();
        });
      });
    };

    return new Promise((resolve, reject) => {
      if (!_isLoggedIn) {
        _login(credential.username, credential.password)
          .then(fetchLink)
          .then(download)
          .then(resolve)
          .catch(reject);
      } else {
        fetchLink()
          .then(download)
          .then(resolve)
          .catch(reject);
      }
    });
  };

  this.onHighlightsReady = function () {
    return new Promise((resolve, reject) => {
      legendasTvRequest('/', (err, response, body) => {
        if (err) reject(err);

        _fetchWeeklyHighlights(body);
        resolve(_movies);
      });
    });
  };

  this.onSearchReady = function (search, page) {
    return new Promise((resolve, reject) => {
      var pageUrl = '';

      if (page) pageUrl = '/-/' + page + '/-';

      var uri = 'legenda/busca/' + encodeURI(search) + '/1' + pageUrl;

      legendasTvRequest(uri, (err, response, body) => {
        if (err) reject(err);

        _fetchSearchResult(body);
        resolve(_movies);
      });
    });
  };

  this.onFetchSynopsis = function (id) {
    return _fetchSynopsis(_movies.get(id));
  };

  this.onDownloadSubtitle = function (id) {
    return _downloadSubtitle(_movies.get(id));
  };

  this.isLoggedIn = function () {
    return _isLoggedIn;
  };

  this.fetchDate = function () {
    return _fetchedAt;
  };

  this.clean = function () {
    _movies.splice(0, _movies.length);
    _fetchedAt = null;

    return this;
  };
};

module.exports = new LegendasTv();