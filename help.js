var globalOptions = [
    'a) Show all releases;',
    'b) Show only blu-ray quality releases;',
    'h) Help;',
    'q) Quit;'
];

exports.showGlobalOptions = function () {
    globalOptions.forEach(function (option) {
        console.log(option);
    });
};

exports.showSystemHeader = function () {
    console.log('\nLEGENDAS.TV - Destaques da semana');
    console.log('---------------------------------\n');
};