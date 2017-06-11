var legendasTv = require('./legendas-tv');
var help = require('./help');

var menuHandler;

var showMoviesOptions = function () {
    help.showMoviesOptions();

    menuHandler = function (option) {
        if (option === 'b') {
            showGlobalOptions();
            return;
        }

        if (/\d{1,}/g.test(option)) {
            try {
                legendasTv.onSynopsisReady(option, function (movie) {
                    help.showMovieDetails(movie);
                });
            } catch (error) {
                console.log(error.message);
            }

            return;
        }

        help.showMoviesOptions();
    };
}

var showGlobalOptions = function () {
    help.showGlobalOptions();

    menuHandler = function (option) {
        switch (option) {
            case 'a':
                legendasTv.onSearchable(function (movies) {
                    help.showMovies(movies);
                    showMoviesOptions();
                });
                break;
            case 'b':
                legendasTv.onSearchable(function (movies) {
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

