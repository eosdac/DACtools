#!/bin/bash

source ./conf_private.sh
source ./conf_dac.sh
source ./conf.sh
source ./functions.sh


echo -e "\n\n----------------- RESIGNING -------------------\n\n";

RESIGNER=eosdaccustaa

run_cmd "push action daccustodian withdrawcand '[\"$RESIGNER\"]' -p $RESIGNER"
run_cmd "get currency balance $dactokens $RESIGNER EOSDAC"
run_cmd "push action daccustodian unstake '[\"$RESIGNER\"]' -p $RESIGNER"
run_cmd "get currency balance $dactokens $RESIGNER EOSDAC"
