var koa = require('koa');
var mongo = require('koa-mongo');

var app = koa();

app.use(mongo());
app.use(function* (next) {
    this.mongo
        .db('myproject')
        .collection('documents')
        .findOne({}, function (err, doc) {
            console.log(doc);
        });

    this.body = yield this.mongo.db('myproject').collection('documents').findOne();
});
app.listen(3000);
