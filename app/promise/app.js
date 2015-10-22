var getJSON = function(r) {
    var promise = new Promise(function (resolve, reject) {
        console.log(1);
        setTimeout(function(){
            var r = Math.random();
            if (r<0.5) {
                console.log(resolve);
                resolve(r);
                console.log(2);
            } 
            else {
                console.log(reject);
                reject(r);
                console.log(3);
            }
        }, 200);
    });

    return promise;
}

// getJSON(Math.random());
var p = getJSON(Math.random())
    .then(funcs(1.1), funcs(1.2))
    .then(funcs(2.1), funcs(2.2))
    .then(null, funcs(3.2))
    ;


console.log(p);

function funcs(a) {
    return function(r) {
        console.log(r);
        console.log(a);
        return a;
    }
}

console.log(Promise.resolve('hello'));
Promise.resolve('world')
    .then(funcs(5));

