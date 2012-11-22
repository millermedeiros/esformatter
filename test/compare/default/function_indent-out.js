// indent, spaces
function foo(x){
    return x;
}

// test space on params
function bar(a, b, c) {
    // test indentation
    return 'lorem'; // test comment
}

// test nested fn
function dolor() {
    function fn() {
        return 'foo';
    }
    // test invocation
    setTimeout(fn, 100);
}

// invocation
dolor();
