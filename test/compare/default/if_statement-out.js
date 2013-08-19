if (true) {
    doStuff()
}

if (foo || bar) {
    if (bar === 'bar') {
        // nested
        log('nested if');
    } else {
        log('nested else')
    }
} else if (baz == null) {
    // else if
    log('elseif');
} else {
    // else
    log('else');
    // should keep the 2 empty lines


}

if (singleLine) singleLine();


// it's a trap!
if (asi && noBraces) dolor()
else amet();


// issue #7
function iss7() {
    if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
        return;
    }
}

// issue #32
if (foo === bar &&
    foo > bar) {
    foo = bar;
}
(function() {
    if (foo === bar &&
        //bla bla bla
        foo > bar) {
        foo = bar;
    } else if (foo > bar ||
        foo <= bar) {
        foo = bar;
    } else {
        foo = bar;
        if (foo !== bar) {
            foo = bar;
        } else if (foo > bar ||
            //Hey ho
            foo <= bar) {
            bar = foo;
        }
    }
})();
