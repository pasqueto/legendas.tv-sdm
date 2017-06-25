exports.showSystemHeader = function () {
  console.log('\nLEGENDAS.TV - Destaques da semana');
  console.log('---------------------------------');
};

exports.showGlobalOptions = function () {
  [
    '\na) Show all releases;',
    'b) Show only blu-ray quality releases;',
    's) Search release;',
    'q) Quit;'
  ].forEach(function (option) {
    console.log(option);
  });
};

exports.showMovies = function (movies, date) {
  process.stdout.write('\n');

  movies.forEach(function (movie) {
    console.log('# ' + ('0' + movie.id).slice(-2) + ': ' + movie.title);
  });

  if (date) console.log('\nFetched at ' + date);
};

exports.showMoviesWithInfo = function (movies, date) {

  movies.forEach(function (movie) {
    console.log('\n# ' + ('0' + movie.id).slice(-2) + ': ' + movie.title);
    console.log('Release: ' + movie.release);
    console.log('Date: ' + movie.date);
  });

  if (date) console.log('\nFetched at ' + date);
};

exports.showMovieOptions = function () {
  console.log('\nd) Download subtitle;');
  console.log('b) Back;')
};

exports.showMoviesOptions = function () {
  console.log('\n#) Select movie;');
  console.log('b) Back;')
};

exports.showMovieDetails = function (movie) {
  console.log('\n' + movie.title);
  console.log(new Array(movie.title.length + 1).join('-'));
  console.log('\n' + movie.synopsis);
  console.log('\nrelease: ' + movie.release);
  console.log('date: ' + movie.date);
  console.log('rate: ' + movie.rate);
};

