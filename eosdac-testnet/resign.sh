#!/bin/bash


green=`tput setaf 2`
reset=`tput sgr0`

source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh


run_cmd() {
        cmd="$1";
        echo -e "\n\n >> ${green} Next command: $1 \n\n ${reset}";
        #wait;
        #read -p "Press enter to continue ${reset}";
        eval "cleos -u $API_URL $1";
}


echo -e "\n\n----------------- RESIGNING -------------------\n\n";

RESIGNER=eosdaccustaa

run_cmd "push action daccustodian withdrawcand '[\"$RESIGNER\"]' -p $RESIGNER"
run_cmd "get currency balance $dactokens $RESIGNER EOSDAC"
run_cmd "push action daccustodian unstake '[\"$RESIGNER\"]' -p $RESIGNER"
run_cmd "get currency balance $dactokens $RESIGNER EOSDAC"
