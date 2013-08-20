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

// "catch" brace indent
function issueNN(obj) {
    try {
        x = y;
    } catch (e) {
        console.log(e);
    }
}

// "finally" brace indent
jQuery.ready.promise = function(obj) {
    try {
        top = window.frameElement == null && document.documentElement;
    } catch (e) {
        console.log(e);
    } finally {
        top = 0;
    }
};

// nested try-catch
function nestedTryCatch() {
    try {
        normalPath();
    } catch (e) {
        try {
            alternatePath();
        } catch (e) {
            console.log(e);
        } finally {}
    } finally {
        shouldBreak = true;
    }
    next();
}