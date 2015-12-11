var config = require('./config');
var router = require('koa-router')();

module.exports = router;

router.get('/authors', function *(next) {

        yield * next;

        var db = this.mongo.db(config.dbName);
        var notes = yield db.collection('t_notes')
            .aggregate([  
                {  
                    $group: { 
                        _id: '$author'
                        // , notes: {
                        //     $push: {
                        //         file_name: '$file_name'
                        //         , modified_time: '$modified_time'
                        //     } 
                        // }
                        , count: {$sum: 1}    
                    }      
                }
            ])
            .sort({count: -1})
            .toArray()
            ;

        this.body = notes;
    })
    ;

router.get('/notes-by-author/:author', function *(next) {
        var params = this.params,
            author = params.author;

        yield * next;

        var db = this.mongo.db(config.dbName);
        var notes = yield db.collection('t_notes')
            .find({author: author}, {_id:0})
            .sort({modified_time:-1})
            .toArray()
            ;

        this.body = notes;
    })
    ;

router.get('/noteslatest/:from/:context_num', function *(next) {
        var params = this.params,
            from = params.from - 0,
            contextNum = params.context_num - 0;

        yield * next;

        var db = this.mongo.db(config.dbName);
        var notes = yield db.collection('t_notes')
            .find({}, {_id:0})
            .sort({modified_time:-1})
            .toArray()
            ;

        notes = notes.slice(from, from + contextNum);

        for(var i=0; i<notes.length; i++){
            var note = notes[i];
            var lines = yield db.collection('t_lines') 
                .find({note_id: note.note_id}, {_id:0, note_id:0})
                .sort({lineno:1})
                .toArray();
            note.lines = lines;
        }

        this.body = notes;
    })
    ;

router.get('/notes/:from_note_id/:context_num', function *(next) {
        yield * next;
        this.body = yield this.mongo.db(config.dbName)
            .collection('t_notes')
            .find({note_id: {$gte: this.params.from_note_id - 0}})
            .limit(this.params.context_num - 0 + 1)
            .toArray();
    })
    ;

router.get('/note/:note_id/:has_lines', function *(next) {
        yield * next;

        var lines = [];
        
        if (this.params.has_lines - 0 == 1) {
            lines = yield this.mongo.db(config.dbName)
                    .collection('t_lines')
                    .find({note_id: this.params.note_id - 0})
                    .toArray();
        }

        var note = yield this.mongo.db(config.dbName)
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

        var lines = yield this.mongo.db(config.dbName)
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
        var _keywords = [];
        for(var i=0; i<keywords.length; i++){
            _keywords.push(keywords[i]);
            keywords[i] = keywords[i].replace(/[\\*|.^$?+{}\[\]\(\)-]/g, '\\$&');
        }

        var regArr = [];
        for(var i=0; i<keywords.length; i++){
            regArr.push({
                text: {
                    $regex: new RegExp(keywords[i], 'gi')
                }
            });
        }

        var db = this.mongo.db(config.dbName);

        var lines = yield db.collection('t_lines')
                .find({$and: regArr})
                .sort({lineno: 1})
                .toArray();

        var allLines = [];

        for(var i=from, cnt=0; i<lines.length && cnt<count; i++, cnt++){
            allLines = allLines.concat(
                yield db.collection('t_lines')
                    .find(
                        {$and: [
                            {lineno: {$gte: lines[i].lineno - contextNum}}
                            , {lineno: {$lte: lines[i].lineno + contextNum}}
                            , {note_id: lines[i].note_id}
                        ]}
                        , {_id:0}
                    )
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

        this.body = {
            count: lines.length 
            , lines: allLines 
            , keywords: _keywords 
        };
    })
    ;



