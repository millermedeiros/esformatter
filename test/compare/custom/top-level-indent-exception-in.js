(function() {

    // top level block isn't indented
    var x = 123;

    setTimeout(function() {
        x();
    });

}());

// don't mess up other code outside a function scope
var x = {
    abc: 123
};
