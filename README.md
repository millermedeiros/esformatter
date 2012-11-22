# esbeauty

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


## How?

This tool uses [falafel](https://github.com/substack/node-falafel) (based on
Esprima) to recursively parse the code and transform it *in place*.


## Popular Alternatives

 - [jsbeautifier](http://jsbeautifier.org/)


## License

Released under the MIT license


