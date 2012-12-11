// we run mocha manually otherwise istanbul coverage won't work
// run `npm test --coverage` to generate coverage report

var Mocha = require('mocha');

var m = new Mocha({
    ui : 'bdd',
    // we use the dot reporter on travis
    reporter : !!process.env.npm_config_dot? 'dot' : 'spec'
});

m.addFile('test/format.spec.js');

m.run(function(){
    process.exit();
});

