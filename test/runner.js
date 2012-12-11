"use strict";

// we run mocha manually otherwise istanbul coverage won't work
// run `npm test --coverage` to generate coverage report

var Mocha = require('mocha');


var m = new Mocha({
    ui : 'bdd',
    // we use the dot reporter on travis since it works better
    reporter : (process.env.npm_config_reporter || 'spec'),
    grep : process.env.npm_config_grep
});

if (process.env.npm_config_invert) {
    m.invert();
}


m.addFile('test/format.spec.js');

m.run(function(err){
    var exitCode = err? 1 : 0;
    process.exit(exitCode);
});

