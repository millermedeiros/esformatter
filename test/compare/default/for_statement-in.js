for(var i=0,
                    n=things.length;
i<    n;
i   +=  1  ){
// 1
    things[i];
}

for (i= 0; i< n;++i)   { // 2
things[i]; }

for (; i< n;++i) { foo(i); /* 3 */ }


for (; i< n;++i)
{
// 4
for(; j  > 0; --j) {
// 5
things[i][j]; }
}

// 6
for 
    (;;) {
        things[i];
                }

