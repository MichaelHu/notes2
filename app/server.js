var app = require('koa')();
var router = require('koa-router')();
var config = {
    staticRoot: '/Users/hudamin/projects/git/mydocs/dist/'
};

router.get('/notes/:from_note_id/:context_num', function *(next) {
        yield * next;
        this.body = yield this.mongo.db('myproject')
            .collection('t_notes')
            .find({note_id: {$gte: this.params.from_note_id - 0}})
            .limit(this.params.context_num - 0 + 1)
            .toArray();
    })
    ;

router.get('/note/:note_id', function *(next) {
        yield * next;
        var lines = yield this.mongo.db('myproject')
                .collection('t_lines')
                .find({note_id: this.params.note_id - 0})
                .toArray();

        var note = yield this.mongo.db('myproject')
                .collection('t_notes')
                .find({note_id: this.params.note_id - 0})
                .toArray();

        this.body = [note[0], lines];
    })
    ;

router.get('/notelines/:line/:context_num/:direction', function *(next) {
        yield * next;
        var params = this.params,
            line = params.line - 0,
            contextNum = params.context_num - 0,
            direction = params.direction - 0;

        var _ = require('underscore');

        var lines = yield this.mongo.db('myproject')
                .collection('t_lines')
                .find({$and: [
                    {lineno: {$lte: line + contextNum}}
                    , {lineno: {$gte: line - contextNum}}
                ]})
                .toArray();
        var index = _.findIndex(lines, function(item){
                    return item.lineno == line;
                });

        var result = lines; 
        if(direction == 1) {
            result = lines.slice(index);
        }
        else if(direction == -1) {
            result = lines.slice(0, index + 1);
        }

        this.body = result;
    })
    ;

router.get('/notesearch/:keywords/:context_num/:from/:count', function *(next) {
        yield * next;

        var params = this.params,
            keywords = params.keywords,
            contextNum = params.context_num - 0,
            from = params.from - 0,
            count = params.count - 0;

        keywords = keywords.split(/\s+\+\s+/);
        var _keywords = {};
        for(var i=0; i<keywords.length; i++){
            _keywords['key_word_' + ( i + 1 )] = keywords[i];
            keywords[i] = keywords[i].replace(/[\\*|.^$?+{}\[\]-]/g, '\\$&');
        }

        var regArr = [];
        for(var i=0; i<keywords.length; i++){
            regArr.push({
                text: {
                    $regex: new RegExp(keywords[i], 'gi')
                }
            });
        }

        var db = this.mongo.db('myproject');

        var lines = yield db.collection('t_lines')
                .find({$and: regArr})
                .toArray();

        var allLines = [];

        for(var i=from-1, cnt=0; i<lines.length && cnt<count; i++, cnt++){
            allLines = allLines.concat(
                yield db.collection('t_lines')
                    .find({$and: [
                        {lineno: {$gte: lines[i].lineno - contextNum}}
                        , {lineno: {$lte: lines[i].lineno + contextNum}}
                    ]})
                    .toArray()
            );
        }

        var _ = require('underscore');

        console.log(allLines.length);
        allLines = _.sortBy(allLines, function(item){
                return item.lineno;
            });
        allLines = _.uniq(allLines, function(item){
            return item.lineno;
        });

        console.log(allLines.length);

        this.body = [
            { count: lines.length }
            , allLines 
            , _keywords 
        ];
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

