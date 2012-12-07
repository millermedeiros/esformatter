/*jshint node:true*/
/*global describe:false, it:false*/
"use strict";

var expect = require('expect.js');
var _glob = require('glob');
var _path = require('path');


var esformatter = require('../index');
var _helpers = require('./helpers');

var readOut    = _helpers.readOut;
var readIn     = _helpers.readIn;
var readConfig = _helpers.readConfig;


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
            });
        });

    });


});

