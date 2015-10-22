var app = require('koa')();
var router = require('koa-router')();
var config = {
    staticRoot: '/Users/hudamin/projects/git/mydocs/dist/'
};

router.get('/hello', function *(next) {
        yield * next;
        this.body = yield this.mongo.db('myproject')
            .collection('documents')
            .find().limit(10).toArray();
    })
    ;

app.use(require('koa-gzip')())
    .use(require('koa-static')(config.staticRoot))
    .use(require('koa-mongo')({
        host: 'localhost'
        , port: 27017
        , db: 'myproject'
        , max: 100
        , min: 1
        , timeout: 30000
        , log: false
    }))
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);

console.log('Listening on port 3000 ...');

