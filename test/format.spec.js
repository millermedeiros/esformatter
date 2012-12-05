
var expect = require('expect.js');


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


        describe('function', function () {

            it('should indent function and add spaces around parameters', function () {
                var id = 'default/basic_function_indent';
                var result = esformatter.format( readIn(id) );
                expect( result ).to.equal( readOut(id) );
            });

            it('should indent nested functions and function calls', function () {
                var id = 'default/mixed_function_indent';
                var result = esformatter.format( readIn(id) );
                expect( result ).to.equal( readOut(id) );
            });

        });


        describe('invocation', function () {
            it('should indent object argument', function () {
                var id = 'default/invocation_obj';
                var result = esformatter.format( readIn(id) );
                expect( result ).to.equal( readOut(id) );
            });
        });


    });


});

