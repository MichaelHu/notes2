'use strict';
var koa = require('koa');
var app = koa();
var router = require('koa-routing');

console.log(router);

app.use(require('koa-body')());
app.use(require('koa-validate')());
app.use(require('koa-routing')(app));

app.post('/signup', function * () {
    //optional() means this param may not in the params.
    this.checkBody('name').optional().len(2, 20,"are you kidding me?");
    this.checkBody('email').isEmail("your enter a bad email.");
    this.checkBody('password').notEmpty().len(3, 20).md5();
    //empty() mean this param can be a empty string.
    this.checkBody('nick').optional().empty().len(3, 20);
    this.checkBody('age').toInt();
    yield this.checkFile('icon').notEmpty().size(0,300*1024,'file too large').move("/static/icon/" , function*(file,context){
        //resize image
    });
    if (this.errors) {
        this.body = this.errors;
        return;
    }
    this.body = this.request.body;
});

app.get('/users', function * () {
    this.checkQuery('department').empty().in(["sale","finance"], "not support this department!").len(3, 20);    
    this.checkQuery('name').empty().len(2,20,"bad name.").trim().toLow();
    this.checkQuery('age').empty().gt(10,"too young!").lt(30,"to old!").toInt();
    if (this.errors) {
        this.body = this.errors;
        return;
    }
    this.body = this.query;
});

app.get('/user/:id', function * () {
    this.checkParams('id').toInt(0);
    if (this.errors) {
        this.body = this.errors;
        return;
    }
    this.body = this.params;
});


app.listen(3000);
