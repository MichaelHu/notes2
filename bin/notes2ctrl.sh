#!/bin/bash

HOME=/Users/hudamin
MONGOD=$HOME/softwares/mongodb/bin/mongod
DBDATAPATH=$HOME/tmp/mongodb/data
PIDFILE=mongod-pid

NOTES2DATA=$HOME/projects/git/notes2_data
DOCROOT=$HOME/projects/git/mydocs/docs

NOTES2=$HOME/projects/git/notes2
NOTES2PORT=3100

MYNOTES=/$HOME/projects/git/rocket_apps/mynotes
PHPEXEC=/Users/hudamin/softwares/php/bin/php-cgi
MYNOTES2PORT=8700

stop_notes2 () {

    if [ -e $PIDFILE ]; then 
        cat $PIDFILE | xargs kill
        rm $PIDFILE
    fi

    ps aux | grep 'app/notes2.js' | grep $NOTES2PORT | head -1 | awk '{print $2}' | xargs kill

    fis server stop
}


start_notes2 () {

    if [ -e $PIDFILE ]; then 
        cat $PIDFILE | xargs kill
        rm $PIDFILE
        sleep 3
    fi

    $MONGOD --dbpath=$DBDATAPATH --pidfilepath=$PIDFILE &

    node $NOTES2DATA/src/index.js $DOCROOT  

    ps aux | grep 'app/notes2.js' | grep $NOTES2PORT | head -1 | awk '{print $2}' | xargs kill
    sleep 3
    node --use-strict --harmony $NOTES2/app/notes2.js --port $NOTES2PORT &

    pushd $MYNOTES
    fis server stop
    fis release -c
    sleep 3
    fis server start -p $MYNOTES2PORT --php_exec $PHPEXEC --rewrite 
    popd

    open http://test.irice.com:8700/mynotes/mynotes.html

}


echo $1

if [ "$1" == "stop" ]; then
    stop_notes2
else
    start_notes2
fi

