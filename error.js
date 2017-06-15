exports.MovieNotFound = function () {
    this.message = 'Movie not found.';
    this.type = 'movieNotFound';
};

exports.InvalidCredential = function () {
    this.message = 'Invalid username or password.';
    this.type = 'invalidCredential';
};