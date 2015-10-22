
function * helloWorldGenerator () {
    yield 'hello';
    var m = yield 'world';
    console.log('yield: ' + m);
    return 'ending';
}

var hw = helloWorldGenerator();

console.log(hw.next());
var tmp = hw.next();
console.log(tmp);
console.log(hw.next(tmp.value));
console.log(hw.next());


function * fibonacci () {
    let prev = 0, curr = 1;
    for (;;) {
        let tmp = curr;
        curr = prev + curr;
        prev = tmp;
        yield curr;
    }
}

/*
for ( var n of fibonacci() ) {
    if (n > 1000) break;
    console.log(n);
}
*/

var n = fibonacci(), m = 10;
while (m-- > 0) {
    console.log(n.next().value);
}

/*
let a = 5, b = 6;
console.log(a, b);
*/
