var keyboard = require('./keyboard');
var legendasTv = require('./legendas-tv');
var help = require('./help');

var showMovies = function (movies) {
    movies.forEach(function (movie, i) {
        console.log(++i + ' - ' + movie.name);
        console.log('release: ' + movie.release);
        console.log('date: ' + movie.date + '\n');
    });
};

help.showSystemHeader();
help.showGlobalOptions();

keyboard.onReadable(function (option) {
    switch (option) {
        case 'a':
            legendasTv.onSearchable(function (movies) {
                showMovies(movies);
            });
            break;
        case 'b':
            legendasTv.onSearchable(function (movies) {
                showMovies(movies.bluRay());
            });
            break;
        case 'h':
            help.showGlobalOptions();
            break;
        case 'q':
            process.exit();
            break;
        default:
            help.showGlobalOptions();
    }
});