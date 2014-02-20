var foo = function(){};
var bar = function(a, b, c){something();};
var baz = function baz(a, b, c){something();};
call(function() {something();});
call(x,function(){x();});
call(function(){x();},x);
