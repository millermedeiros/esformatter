foo();

bar(1,'dolor');ipsum(3,{amet:true},'foo');

dolor=foo(2)

// should remove line breaks
foo(a,b,
c,d)


// it should indent chained calls if there is a line break between each call
foo.bar()
                // comment
                .ipsum()
.dolor();

function foo() {
dolor
    // comment
    .amet()
                .maecennas();
}

returned.promise().done(foo)
// comment
.done(newDefer.resolve)
.fail(newDefer.reject)
// comment
.progress(newDefer.notify);

