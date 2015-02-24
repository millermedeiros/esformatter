foo();

bar(1,'dolor');
ipsum(3,{amet:true},'foo');

dolor=foo(2)

// should not remove line breaks
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

contents = this.headers.next()
  .removeClass("ui-helper-reset ui-widget-content ui-corner-bottom " +
    "ui-accordion-content ui-accordion-content-active ui-state-disabled")
  .css("display", "")
  .removeAttr("role");

returned.promise().done(foo)
// comment
.done(newDefer.resolve)
.fail(newDefer.reject)
// comment
.progress(newDefer.notify);

filter(function() {
// comment
x;
}).map(function() {
// comment
y;
});

var contents;
contents = this.headers.next()
.removeClass("ui-state-disabled")
.css("display", "");

gulp.task('lint', function() {
return gulp.src('**.js')
.pipe(jshint())
.pipe(jshint.reporter(stylish));
});

// issue #68
define(function() {
    // line comment
    x;
});


noArgs(
      );

noArgs2(    );
noArgs3();


// only indent if there is a line break before/between arguments
indent(
'foo'
);

indent2({
dolor: 123
}, [
1, 2, 3
]);

// this is a weird style but makes sense to indent args if you think about it
indent3('lorem',
{
ipsum: 'dolor'
},
[
1,
2,
3
]);

indent4({
a: b
});
indent5(
{
a: b
},
[1, 2, 3]
);
indent6(
{
a: b
}, [
1, 2, 3
]
);
