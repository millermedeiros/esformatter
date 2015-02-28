"use strict";

var npmRun = require('npm-run').sync;

// ---

// run cli tools in series passing the stdout of previous tool as stdin of next
// one
exports.run = run;
function run(commands, input) {
  if (!commands) {
    return input;
  }
  return commands.reduce(function(input, cmd) {
    return npmRun(cmd, { input: input });
  }, input);
}
