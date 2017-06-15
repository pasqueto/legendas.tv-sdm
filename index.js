var legendasTv = require('./legendas-tv');
var help = require('./help');

var menuHandler;

var showMovieOptions = function (idMovie) {
    help.showMovieOptions();

    menuHandler = function (option) {
        switch(option) {
            case 'b':
                showMoviesOptions();
                break;
            case 'd':
                legendasTv.onDownloadSubtitle(idMovie, function (filename) {
                    console.log('\n' + filename + ' downloaded');
                    showMoviesOptions();
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

var showGlobalOptions = function () {
    help.showGlobalOptions();

    menuHandler = function (option) {
        switch (option) {
            case 'a':
                legendasTv.onReady(function (movies) {
                    help.showMovies(movies);
                    showMoviesOptions();
                });
                break;
            case 'b':
                legendasTv.onReady(function (movies) {
                    help.showMovies(movies.bluRay());
                    showMoviesOptions();
                });
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

