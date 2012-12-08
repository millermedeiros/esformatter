# esformatter [![Build Status](https://secure.travis-ci.org/millermedeiros/esformatter.png?branch=master)](https://travis-ci.org/millermedeiros/esformatter)

ECMAScript code beautifier/formatter.



## Why?

[jsbeautifier.org](http://jsbeautifier.org/) doesn't have enough options and
not all IDEs/Editors have a good JavaScript code formatter. I would like to
have a command line tool (and standalone lib) as powerful/flexible as the
[WebStorm](http://www.jetbrains.com/webstorm/) and
[FDT](http://fdt.powerflasher.com/) code formatters.

This tool could also be reused by other node.js libs like
[escodegen](https://github.com/Constellation/escodegen/) to format the output
(so each lib has a single responsibility).

For more reasoning behind it and history of the project see: [esformatter
& rocambole](http://blog.millermedeiros.com/esformatter-rocambole/)



## How?

This tool uses [rocambole](https://github.com/millermedeiros/rocambole) (based
on Esprima) to recursively parse the tokens and transform it *in place*.



## Goals

 - granular control about white spaces, indent and line breaks.
 - have as many settings as possible so the user can tweak it to his own needs.
 - command line interface (cli).
 - be non-destructive.
 - option to control automatic semicolon insertion (asi).
 - support for local/global config file so settings can be shared between team
   members.
 - be the best JavaScript code formatter.



## Important

This tool is still on early development and is missing support for many
important features.

Contributors are always welcome.



## Project structure

The `master` branch will only contain *stable* code (tests should be passing to
be merged into master). Development of new features will be done in separate
branches and merged after *completion* (when tests are passing).


### Default Settings

The default settings should be as *conservative* as possible, [Google
JavaScript Style
Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)
should be used as a reference.


### Tests

Tests are done by comparing the result of `esformatter.parse()` of files with
name ending on `-in.js` with the files `-out.js`. The folder
`test/compare/default` tests the default settings and files inside
`test/compare/custom` tests custom settings. Tests inside the `compare/custom`
folder should try to test the *opposite* of the default settings whenever
possible.

To run the tests install the devDependencies by running `npm install --dev`
(only required once) and then run `npm test`.

`mocha` and `expect.js` source code was edited to provide better error
messages. See [mocha/issues/657](https://github.com/visionmedia/mocha/pull/657)
and [expect.js/issues/34](https://github.com/LearnBoost/expect.js/pull/34) for
more info.

To check code coverage run `npm test --coverage`.




## Popular Alternatives

 - [jsbeautifier](http://jsbeautifier.org/)



## License

Released under the MIT license


