/*
 * grunt-esformatter
 *
 * Copyright (c) 2013 Jörn Zaefferer, contributors
 * Licensed under the MIT license.
 */

'use strict';

var esformatter = require( 'esformatter' );

module.exports = function( grunt ) {

grunt.registerMultiTask( 'esformatter', 'Format JS files', function() {
	var options = this.options({});
	this.files.forEach(function( f ) {
		f.src.filter(function( file ) {
			return grunt.file.exists( file );
		}).forEach(function( file ) {
			var content = grunt.file.read( file );
			grunt.file.write( file, esformatter.format( content, options ) );
		});
	});
});

};
