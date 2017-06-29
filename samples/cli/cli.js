var legendasTv = require('../../../legendas-tv');
var help = require('./help');

var menuHandler;
var _globalOptionChosen;
var _movies = [];

var showMovieOptions = function (index) {
  help.showMovieOptions();

  var backToMovies = function () {

    if (_globalOptionChosen === 's') {
      help.showMoviesWithInfo(_movies);
    } else {
      help.showMovies(_movies, legendasTv.fetchDate());
    }

    showMoviesOptions();
  };

  menuHandler = function (option) {
    switch (option) {
      case 'b':
        backToMovies();
        break;
      case 'd':
        legendasTv.onDownloadSubtitle(_movies[index].id)
          .then(filename => {
            console.log('\n' + filename + ' downloaded');
          })
          .then(backToMovies);
        break;
      default:
        showMovieOptions(index);
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
        legendasTv.onFetchSynopsis(_movies[option].id)
          .then(help.showMovieDetails)
          .then(() => { showMovieOptions(option) });
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

    legendasTv.clean().onSearchReady(search)
      .then(movies => {
        help.showMoviesWithInfo(movies);
        _movies = movies;
      })
      .then(showMoviesOptions);
  };
};

var showGlobalOptions = function () {
  help.showGlobalOptions();

  menuHandler = function (option) {
    _globalOptionChosen = option;

    switch (option) {
      case 'a':
        legendasTv.clean().onHighlightsReady()
          .then(movies => {
            help.showMovies(movies, legendasTv.fetchDate());
            _movies = movies;
          })
          .then(showMoviesOptions);
        break;
      case 'b':
        legendasTv.clean().onHighlightsReady()
          .then(movies => {
            help.showMovies(movies.bluRay(), legendasTv.fetchDate());
            _movies = movies.bluRay();
          })
          .then(showMoviesOptions);
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

  process.stdin.on('readable', () => {
    var chunk = process.stdin.read();
    if (chunk) menuHandler(chunk.toString().replace(/[\r\n]+/, ''));
  });
})();