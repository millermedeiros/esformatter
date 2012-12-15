"use strict";

// we run mocha manually otherwise istanbul coverage won't work
// run `npm test --coverage` to generate coverage report

var Mocha = require('mocha');
var expect = require('expect.js');


// ---


// monkey-patch expect.js for better diffs on mocha
// see: https://github.com/LearnBoost/expect.js/pull/34

var origBe = expect.Assertion.prototype.be;
expect.Assertion.prototype.be =
expect.Assertion.prototype.equal = function(obj){
    this._expected = obj;
    origBe.call(this, obj);
};

expect.Assertion.prototype.assert = function (truth, msg, error) {
    msg = this.flags.not ? error : msg;
    var ok = this.flags.not ? !truth : truth;
    if (!ok) {
        var err = new Error(msg.call(this));
        if ('_expected' in this) {
            err.expected = this._expected;
            err.actual = this.obj;
        }
        throw err;
    }
    this.and = new expect.Assertion(this.obj);
};


// ---


var opts = {
    ui : 'bdd',
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

m.run(function(err){
    var exitCode = err? 1 : 0;
    if (err) console.log('failed tests: '+ err);
    process.exit(exitCode);
});

