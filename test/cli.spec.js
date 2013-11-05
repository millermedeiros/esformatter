/*jshint node:true*/
/*global describe:false, it:false*/
"use strict";

var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var helpers = require('./helpers');

describe('Command line interface', function() {
  var filePath;
  var configPath;

  /**
   * Spawn a child process calling the bin file with the specified options
   * @param {String} options Same as you would pass in the command line
   * @param {String} input Standard input
   * @param {Function} testCallback It receives the formatted file
   */
  var spawnEsformatterWith = function(options, input, testCallback) {
    var args = [path.join(__dirname + '/../bin/esformatter')];
    if (typeof options === 'function') {
      testCallback = options;
      options = null;
    } else if (typeof input === 'function') {
      testCallback = input;
      input = null;
    }
    if (options) {
      args = args.concat(options.split(" "));
    }
    it('spawn esformatter with ' + options, function(mochaCallback) {
      var childprocess = spawn('node', args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      var output = "";
      var errorInChildProcess = "";
      childprocess.stdout.on('data', function(data) {
        output += data.toString();
      });
      childprocess.stderr.on('data', function(data) {
        errorInChildProcess += data.toString();
      });
      childprocess.on('exit', function() {
        if (errorInChildProcess) {
          mochaCallback(new Error(errorInChildProcess));
        } else {
          try {
            // There is an extra line feed from piping stdout
            testCallback(helpers.lineFeed(output));
            mochaCallback();
          } catch (ex) {
            mochaCallback(ex);
          }
        }
      });
      if (input) {
        try {
          var textInput = fs.readFileSync(input, 'utf-8');
          childprocess.stdin.write(textInput);
          childprocess.stdin.end();
        } catch (ex) {
          mochaCallback(ex);
        }
      }
    });
  };


  // Format a file with default options
  filePath = path.join(__dirname + '/compare/default/array_expression-in.js');
  spawnEsformatterWith(filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/default/array_expression'));
  });

  // Format a file specifying some options
  filePath = path.join(__dirname + '/compare/custom/basic_function_indent-in.js');
  configPath = path.join(__dirname + '/compare/custom/basic_function_indent-config.json');
  spawnEsformatterWith("--config " + configPath + " " + filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/custom/basic_function_indent'));
  });

  // Format a file from standard input
  filePath = path.join(__dirname + '/compare/default/assignment_expression-in.js');
  spawnEsformatterWith(null, filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/default/assignment_expression'));
  });

  // Format a file from standard input with options
  filePath = path.join(__dirname + '/compare/custom/call_expression-in.js');
  configPath = path.join(__dirname + '/compare/custom/call_expression-config.json');
  spawnEsformatterWith("--config " + configPath, filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/custom/call_expression'));
  });
});
