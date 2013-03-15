foo=bar; lorem   =123
dolor =   "amet"

// yes, this is valid JS
maecennas

+=

    "ullamcor"
// end multi-line


foo =   fn(1);


// assignment operators

x+= y
x   -= y
x *=   y
x /=   y
x%= y
x<<=    y
x   >>= y
x  
    >>>= 
            y
x&= y
x^=y
x|=y


// multiple same line
this.a=b;this.c=d;this.e=f;this.g=h||0;

function h(a,b,c,d,e){this._listener=b;this._isOnce=c;this.context=d;this._signal=a;this._priority=e||0}


// test for issue #5 (related to parenthesis)
doc=(context&&context.nodeType?context.ownerDocument||context:document);


// issue #8 (multiple assignment + OR + indent)
function iss8(){
    if (proxy) {
        proxy.guid = fn.guid = fn.guid || jQuery.guid++;
    }
}
