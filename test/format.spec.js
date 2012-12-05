
var expect = require('expect.js');
var _glob = require('glob');
var _path = require('path');


var esformatter = require('../index');
var _helpers = require('./helpers');

var readFile    = _helpers.readFile;
var readOut     = _helpers.readOut;
var readIn      = _helpers.readIn;
var purgeFolder = _helpers.purge;
var mkdir       = _helpers.mkdir;


// ---


describe('esformatter.format()', function () {

    describe('default options', function () {

        var pattern = _path.join(_helpers.COMPARE_FOLDER, 'default/*-in.js');
        _glob.sync( pattern ).forEach(function(fileName){
            var id = 'default/'+ _path.basename(fileName).slice(0, -6);

            it('indent and add white spaces - '+ id, function () {
                var result = esformatter.format( readIn(id) );
                expect( result ).to.equal( readOut(id) );
            });

        });

    });


});

