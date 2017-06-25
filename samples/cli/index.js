var legendasTv = require('../../../legendas-tv');
var help = require('./help');

var menuHandler;
var _globalOptionChosen;
var _movies = [];

var showMovieOptions = function (idMovie) {
  help.showMovieOptions();

  var backToMovies = function () {
    if (_globalOptionChosen === 'a') {
      help.showMovies(_movies, legendasTv.fetchDate().toString());
    }

    if (_globalOptionChosen === 'b') {
      help.showMovies(_movies.bluRay(), legendasTv.fetchDate().toString());
    }

    if (_globalOptionChosen === 's') {
      help.showMoviesWithInfo(_movies);
    }

    showMoviesOptions();
  };

  menuHandler = function (option) {
    switch (option) {
      case 'b':
        backToMovies();
        break;
      case 'd':
        legendasTv.onDownloadSubtitle(idMovie, function (filename) {
          console.log('\n' + filename + ' downloaded');
          backToMovies();
        });
        break;
      default:
        showMovieOptions(idMovie);
    }
  };
};

var showMoviesOptions = function () {

  help.showMoviesOptions();

  menuHandler = function (option) {
    if (option === 'b') {
      showGlobalOptions();
      return;
    }

    if (/\d{1,}/g.test(option)) {
      try {
        legendasTv.onFetchSynopsis(option, function (movie) {
          help.showMovieDetails(movie);
          showMovieOptions(option);
        });
      } catch (error) {
        console.log(error.message);
      }

      return;
    }

    help.showMoviesOptions();
  };
};

var showSearchOptions = function () {
  process.stdout.write('\nsearch: ');

  menuHandler = function (search) {
    if (!search) {
      showGlobalOptions();
      return;
    }

    legendasTv.onSearchReady(search, function (movies) {
      help.showMoviesWithInfo(movies);
      _movies = movies;
      showMoviesOptions();
    });
  };
};

var showGlobalOptions = function () {
  help.showGlobalOptions();

  menuHandler = function (option) {
    _globalOptionChosen = option;

    switch (option) {
      case 'a':
        legendasTv.clean().onHighlightsReady(function (movies) {
          help.showMovies(movies, legendasTv.fetchDate().toString());
          _movies = movies;
          showMoviesOptions();
        });
        break;
      case 'b':
        legendasTv.clean().onHighlightsReady(function (movies) {
          help.showMovies(movies.bluRay(), legendasTv.fetchDate().toString());
          _movies = movies;
          showMoviesOptions();
        });
        break;
      case 's':
        showSearchOptions();
        break;
      case 'q':
        process.exit();
        break;
      default:
        help.showGlobalOptions();
    };
  };
};

(function () {
  help.showSystemHeader();
  showGlobalOptions();

  process.stdin.on('readable', function () {
    var chunk = process.stdin.read();
    if (chunk) menuHandler(chunk.toString().replace(/[\r\n]+/, ''));
  });
})();