!a
!!foo
!(foo);
;(!!foo)
!(!foo);
!!(!foo);

-x;
-y;

~a; //bitwise NOT is unary

// these are actually UpdateExpression
++foo;
foo++;
--bar;
bar--;

// delete is a UnaryExpression
delete foo.bar;
delete bar.amet;

// need to check indent as well
function fn() {
  !!(!foo);
  delete this.bar
  delete this.amet;
  delete this.ipsum;
}

typeof a === "number" ? x : y;
