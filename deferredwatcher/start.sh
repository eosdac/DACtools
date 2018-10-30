#!/bin/bash
DATADIR="./"

./stop.sh
nodejs deferred_watcher.js  > $DATADIR/deferred-out.log 2> $DATADIR/deferred-err.log &  echo $! > $DATADIR/deferred.pid
