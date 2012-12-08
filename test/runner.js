// we run mocha manually otherwise istanbul coverage won't work
// run `npm test --coverage` to generate coverage report

var Mocha = require('mocha');

var m = new Mocha({
    ui : 'bdd',
    reporter : 'spec'
});

m.addFile('test/format.spec.js');

m.run(function(){
    process.exit();
});

