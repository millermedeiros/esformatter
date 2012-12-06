a || b
a || foo;
foo && bar
;(a || b);
(a && b && c);


// expressions
;(a && b) || foo && bar
;((a && b) || c) || d


// "!" is actually a UnaryExpression but we use it as logical
!a
!!foo
!(foo);
;(!!foo)
!(!foo);
!!(!foo)

