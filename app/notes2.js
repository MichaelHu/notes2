var app = require('koa')();
var config = require('./config');
var router = require('./notes2/');

app.use(require('koa-gzip')())
    .use(require('koa-mongo')({
        host: 'localhost'
        , port: 27017
        , db: config.dbName
        , max: 100
        , min: 1
        , timeout: 30000
        , log: false
    }))
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3100);

console.log('Listening on port 3000 ...');

