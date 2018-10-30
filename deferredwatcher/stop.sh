#!/bin/bash
################################################################################
#
# Scrip Created by http://CryptoLions.io
#
###############################################################################

DIR="./"


    if [ -f $DIR"/deferred.pid" ]; then
        pid=`cat $DIR"/deferred.pid"`
        echo $pid
        kill $pid
        rm -r $DIR"/deferred.pid"

        echo -ne "Stoping Daemon"

        while true; do
            [ ! -d "/proc/$pid/fd" ] && break
            echo -ne "."
            sleep 1
        done
        echo -ne "\rDaemon Stopped.    \n"
    fi
