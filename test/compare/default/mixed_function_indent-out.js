// indent, spaces
function foo(x) {
    return x;
}

// test space on params
function bar(a, b, c) {
    // test indentation
    return 'baz'; // test comment
}

// test nested fn
function dolor() {
    // trailing white space
    // missing semicolon
    function fn() {
        function deep() {
            // moar
            function moar() {
                // nested comment
                return "inner";
            }
            return moar();
        }
        // test invocation
        setTimeout(fn, 100);
    }
}

// invocation
dolor();


// start test keepEmptyLines



// end test keepEmptyLines
