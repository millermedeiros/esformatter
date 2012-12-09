/*jshint node:true*/
/*global describe:false, it:false*/
"use strict";

var esprima = require('esprima');
var expect = require('expect.js');
var _glob = require('glob');
var _path = require('path');

var esformatter = require('../index');

var _helpers = require('./helpers');
var readOut    = _helpers.readOut;
var readIn     = _helpers.readIn;
var readConfig = _helpers.readConfig;


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


describe('esformatter.format()', function () {

    // we generate the specs dynamically based on files inside the copare
    // folder since it will be easier to write the tests and do the comparisson

    describe('default options', function () {

        var pattern = _path.join(_helpers.COMPARE_FOLDER, 'default/*-in.js');
        _glob.sync( pattern ).forEach(function(fileName){
            var id = fileName.replace(/.+(default\/.+)-in\.js/, '$1');
            it(id, function () {
                var result = esformatter.format( readIn(id) );
                expect( result ).to.equal( readOut(id) );
                // result should be valid JS
                expect(function(){
                    esprima.parse(result);
                }).not.to.throwException();
            });
        });

    });


    describe('custom options', function () {

        var pattern = _path.join(_helpers.COMPARE_FOLDER, 'custom/*-in.js');
        _glob.sync( pattern ).forEach(function(fileName){
            var id = fileName.replace(/.+(custom\/.+)-in\.js/, '$1');
            it(id, function () {
                var result = esformatter.format( readIn(id), readConfig(id) );
                expect( result ).to.equal( readOut(id) );
                // result should be valid JS
                expect(function(){
                    esprima.parse(result);
                }).not.to.throwException();
            });
        });

    });


});

