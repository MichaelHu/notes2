var app = require('koa')();
var config = require('./fedocs/config');
var router = require('./fedocs/');

app.use(require('koa-gzip')())
    .use(require('koa-jsonp')())
    .use(require('koa-mongo')({
        host: config.dbHost 
        , port: config.dbPort
        , db: config.dbName
        , max: 100
        , min: 1
        , timeout: 30000
        , log: false
    }))
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(config.port);

console.log('Listening on port ' + config.port + ' ...');

