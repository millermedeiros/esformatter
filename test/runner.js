"use strict";

// we run mocha manually otherwise istanbul coverage won't work
// run `npm test --coverage` to generate coverage report

var Mocha = require('mocha');


// ---


var opts = {
    ui : 'bdd',
    bail: !!(process.env.npm_config_bail),
    reporter : (process.env.npm_config_reporter || 'spec'),
    grep : process.env.npm_config_grep
};

// we use the dot reporter on travis since it works better
if (process.env.TRAVIS) {
    opts.reporter = 'dot';
}

var m = new Mocha(opts);

if (process.env.npm_config_invert) {
    m.invert();
}


m.addFile('test/format.spec.js');
m.addFile('test/cli.spec.js');

m.run(function(err){
    var exitCode = err? 1 : 0;
    if (err) console.log('failed tests: '+ err);
    process.exit(exitCode);
});

