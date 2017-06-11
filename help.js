exports.showSystemHeader = function () {
    console.log('\nLEGENDAS.TV - Destaques da semana');
    console.log('---------------------------------\n');
};

exports.showGlobalOptions = function () {
    [
    'a) Show all releases;',
    'b) Show only blu-ray quality releases;',
    'h) Help;',
    'q) Quit;'
    ].forEach(function (option) {
        console.log(option);
    });
};

exports.showMovies = function (movies) {
    movies.forEach(function (movie) {
        console.log('# ' + ('0' + movie.id).slice(-2) + ' - ' + movie.name);
    });
};

exports.showMoviesOptions = function () {
    console.log('b) Back;')
    console.log('#) Select movie;');
};

exports.showMovieDetails = function (movie) {
    console.log('\n' + movie.name);
    console.log(new Array(movie.name.length + 1).join('-'));
    console.log('\n' + movie.synopsis);
    console.log('\nrelease: ' + movie.release);
    console.log('date: ' + movie.date);
    console.log('rate: ' + movie.rate);
}

