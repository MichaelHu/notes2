var app = require('koa')();
var config = require('./config');
var router = require('./notes2');

app.use(require('koa-gzip')())
    .use(require('koa-static')(config.staticRoot))
    ;

app.listen(3000);

console.log('Listening on port 3000 ...');

