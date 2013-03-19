try {
    foo()
} catch (e) {
    log(e)
}

try {
    // foo comment
    foo();
} finally {
    // bar comment
    bar();
}

try {
    foo()
} catch (e) {
    log(e)
} finally {
    bar()
}


// issue #35: "catch" block indent + empty catch body
jQuery.ready.promise = function(obj) {
    try {
        top = window.frameElement == null && document.documentElement;
    } catch (e) {}
};

