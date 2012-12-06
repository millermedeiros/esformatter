# esformatter

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

This tool uses [rocambole](https://github.com/millermedeiros/rocambole) (based
on Esprima) to recursively parse the tokens and transform it *in place*.



## Important

This tool is still on early development and is missing support for many
important features.



## Popular Alternatives

 - [jsbeautifier](http://jsbeautifier.org/)



## License

Released under the MIT license


