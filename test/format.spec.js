
var esbeauty = require('../index');
var _helpers = require('./helpers');

var readFile    = _helpers.readFile;
var readOut     = _helpers.readOut;
var readIn      = _helpers.readIn;
var purgeFolder = _helpers.purge;
var mkdir       = _helpers.mkdir;


// ---


describe('esbeauty.format()', function () {

    describe('default options', function () {


        describe('function', function () {

            it('should indent function and add spaces around parameters and brackets', function () {
                var id = 'default/function_indent';
                var result = esbeauty.format( readIn(id) );
                // expect( result ).toEqual( readOut(id) );
                expect( result ).toEqual( '==fake==' );
            });

        });


    });


});

