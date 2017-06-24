var fs = require('fs');
var config = require('./config');
var legendasTv = require('../../../legendas-tv');

var _today = new Date();
var _movies = [];

var downloadSubtitle = function (movie) {
  if (!movie) throw new Error('Movie not found.')

  legendasTv.onDownloadSubtitle(movie.id, function (filename) {
    console.log(filename + ' downloaded');
  });
};

var seekSeries = function () {
  config.series.forEach(function (serie, i) {
    if (_today < new Date(serie.releaseDate)) return;
    
    var episodeFound;
    serie.episodes.forEach(function (episode, j) {
      
      try {
        downloadSubtitle(_movies.find(serie.title, episode)[0]);
        episodeFound = j;
      } catch (err) {
        console.log(serie.title + ' ' + episode + ' ' + 'not found');
      }

    });

    if (!episodeFound) return;
    serie.episodes.splice(0, ++episodeFound);
  });

  fs.writeFile('config.json', JSON.stringify(config));
}

legendasTv.onReady(function (movies) {  
  _movies = movies;
  seekSeries();
});

