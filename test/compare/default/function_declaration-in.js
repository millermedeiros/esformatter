function simple(x,y){return x+y;}

function simple_2(a,b,c)
{
                return a+b   +  c    ;
}

// indent, spaces
function foo( x ){ return x; }

// test space on params
function bar(a,b,c){
// test indentation
return 'baz'; // test comment
}

        // test nested fn
    function dolor(){
        // trailing white space
        // missing semicolon
        function fn(){      function deep()   {
            // moar
    function moar() {
// nested comment
            return "inner";
        }
            return moar(   )  ;
        }
            // test invocation
            setTimeout(fn,100);
        }
}

// invocation
dolor();


// start test keepEmptyLines



// end test keepEmptyLines

// test a bug related with indentation and multiple consecutive functions
function outter(){ function a1(){return true}function a2(val){return (val*2)} }


// issue #29 : return + line break + ternary
function iss29(a){
  return
    a<5?23:12;
}
